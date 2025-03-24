import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";

const AskQuestionForm = ({ open, onClose, onSubmit }) => {
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");

  const handleSubmit = () => {
    onSubmit({ title: questionTitle, content: questionContent });
    setQuestionTitle(""); // Clear the form
    setQuestionContent(""); // Clear the form
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose}>
  <DialogTitle>Ask a Question</DialogTitle>
  <DialogContent sx={{ width: "400px" }}> {/* Set width */}
    <TextField
      label="Question Content"
      multiline
      rows={4}
      fullWidth
      value={questionContent}
      onChange={(e) => setQuestionContent(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Cancel</Button>
    <Button onClick={handleSubmit} color="primary">
      Submit
    </Button>
  </DialogActions>
</Dialog>

  );
};

export default AskQuestionForm;
