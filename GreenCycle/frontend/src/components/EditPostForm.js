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

const EditPostForm = ({ open, onClose, onSubmit, initialContent }) => {
  const [content, setContent] = useState(initialContent);
  const contentRef = useRef(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const applyFormatting = (command) => {
    document.execCommand(command, false, null);
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

        const data = await response.json();
        if (data.file) {
          contentRef.current.innerHTML += `<img src="http://localhost:3001/uploads/${data.file}" alt="Uploaded" style="max-width:100%; border-radius:4px;" />`;
        }
      } catch (error) {
        console.error("Image upload failed", error.message);
      }
    }
  };

  const handlePostUpdate = () => {
    const updatedContent = contentRef.current.innerHTML.trim();
    if (!updatedContent) {
      alert("Content cannot be empty.");
      return;
    }
    onSubmit(updatedContent);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit Post
        <IconButton aria-label="close" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{ minHeight: "120px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", cursor: "text" }}
          contentEditable
          suppressContentEditableWarning
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <IconButton onClick={() => applyFormatting("bold")}> <FormatBoldIcon /> </IconButton>
          <IconButton onClick={() => applyFormatting("italic")}> <FormatItalicIcon /> </IconButton>
          <IconButton onClick={() => document.execCommand("undo")}> <UndoIcon /> </IconButton>
          <IconButton onClick={() => document.execCommand("redo")}> <RedoIcon /> </IconButton>
          <IconButton component="label">
            <input type="file" accept="image/*" hidden multiple onChange={handleImageUpload} />
            <ImageIcon />
          </IconButton>
        </div>
      </DialogContent>
      <div style={{ padding: 10, textAlign: "right" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handlePostUpdate}> Update </Button>
      </div>
    </Dialog>
  );
};

export default EditPostForm;
