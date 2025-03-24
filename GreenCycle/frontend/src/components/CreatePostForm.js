import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Box,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import LinkIcon from "@mui/icons-material/Link";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

const CreatePostForm = ({ open, onClose, onSubmit }) => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isLink, setIsLink] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const contentRef = useRef(null);

  const applyFormatting = (command) => {
    document.execCommand(command, false, null);
    updateButtonStates();
  };

  const updateButtonStates = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));

      const anchorTag = selection.anchorNode?.parentElement;
      setIsLink(anchorTag?.nodeName === "A");
    }
  };

  const addImageWithCloseButton = (fileName) => {
    const wrapper = document.createElement("figure");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.marginTop = "10px";
    wrapper.style.marginRight = "10px";
    wrapper.contentEditable = "false";

    const img = document.createElement("img");
    img.src = `http://localhost:3001/uploads/${fileName}`;
    img.alt = "Uploaded Image";
    img.style.maxWidth = "100%";
    img.style.borderRadius = "4px";

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "×";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "-8px";
    closeBtn.style.right = "-8px";
    closeBtn.style.background = "rgba(0,0,0,0.7)";
    closeBtn.style.color = "#fff";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "16px";
    closeBtn.style.lineHeight = "1";
    closeBtn.style.padding = "4px";
    closeBtn.style.borderRadius = "50%";
    closeBtn.style.width = "24px";
    closeBtn.style.height = "24px";
    closeBtn.style.display = "flex";
    closeBtn.style.alignItems = "center";
    closeBtn.style.justifyContent = "center";

    closeBtn.onclick = async () => {
      try {
        await fetch(`http://localhost:3001/api/delete-file?filename=${fileName}`, {
          method: "DELETE",
        });
        wrapper.remove();
      } catch (error) {
        console.error("Failed to delete image:", error.message);
      }
    };

    wrapper.appendChild(img);
    wrapper.appendChild(closeBtn);

    contentRef.current.appendChild(wrapper);
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:3001/api/upload-file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error: ${errorText}`);
        }

        const data = await response.json();
        if (data.file) {
          addImageWithCloseButton(data.file);
        }
      } catch (error) {
        console.error("Image upload failed", error.message);
      }
    }
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setSelectedRange(selection.getRangeAt(0));
    }
    setShowLinkInput(true);
  };

  const insertLink = () => {
    const link = linkUrl.trim();
    if (!link) return;

    if (selectedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectedRange);

      if (isLink) {
        document.execCommand("unlink", false, null);
      } else {
        document.execCommand("createLink", false, link);
        const anchorTags = contentRef.current.getElementsByTagName("A");
        for (let a of anchorTags) {
          a.style.color = "blue";
          a.style.textDecoration = "underline";
        }
      }
    } else {
      contentRef.current.innerHTML += `<a href="${link}" target="_blank" style="color:blue; text-decoration:underline;">${link}</a>`;
    }

    setShowLinkInput(false);
    setLinkUrl("");
    setSelectedRange(null);
  };

  useEffect(() => {
    document.addEventListener("selectionchange", updateButtonStates);
    return () => {
      document.removeEventListener("selectionchange", updateButtonStates);
    };
  }, []);

  const handlePost = () => {
    const contentEditableDiv = contentRef.current;
    if (!contentEditableDiv) return;

    const clonedContent = contentEditableDiv.cloneNode(true);
    const buttons = clonedContent.querySelectorAll("button");
    buttons.forEach((button) => button.remove());

    const updatedContent = clonedContent.innerHTML.trim();

    if (!updatedContent) {
      alert("Content cannot be empty.");
      return;
    }

    onSubmit(updatedContent);
    contentEditableDiv.innerHTML = "";
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create Post
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            minHeight: "120px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "text",
          }}
          contentEditable
          suppressContentEditableWarning
          ref={contentRef}
        ></Box>
        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          {showLinkInput ? (
            <>
              <TextField
                label="Enter link"
                variant="outlined"
                size="small"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
              />
              <Button onClick={() => setShowLinkInput(false)}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={insertLink}>
                Add
              </Button>
            </>
          ) : (
            <>
              <IconButton onClick={() => applyFormatting("bold")} color={isBold ? "primary" : "default"}>
                <FormatBoldIcon />
              </IconButton>
              <IconButton onClick={() => applyFormatting("italic")} color={isItalic ? "primary" : "default"}>
                <FormatItalicIcon />
              </IconButton>
              <IconButton onClick={() => document.execCommand("undo")}>
                <UndoIcon />
              </IconButton>
              <IconButton onClick={() => document.execCommand("redo")}>
                <RedoIcon />
              </IconButton>
              <IconButton component="label">
                <input type="file" accept="image/*" hidden multiple onChange={handleImageUpload} />
                <ImageIcon />
              </IconButton>
              <IconButton onClick={handleLinkClick} color={isLink ? "primary" : "default"}>
                <LinkIcon />
              </IconButton>
            </>
          )}
        </div>
      </DialogContent>
      <div style={{ padding: 10, textAlign: "right" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handlePost}>
          Post
        </Button>
      </div>
    </Dialog>
  );
};

export default CreatePostForm;
