import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
} from "@mui/material";
import {
  ArrowDropUp,
  ArrowDropDown,
  MoreVert,
  PushPin,
  Edit,
  Flag,
  Delete,
  ChatBubbleOutline,
} from "@mui/icons-material";

export default function QuestionCard({
  question,
  onDelete,
  onEdit,
  onFlag,
  onPin,
  onVote,
  userVote, // ⬅️ Pass user’s vote from App.js
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [localVote, setLocalVote] = useState(userVote); // Track vote state

  useEffect(() => {
    setLocalVote(userVote); // Update local state when `userVote` changes
  }, [userVote]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleVote = (direction) => {
    const newVote = localVote === direction ? 0 : direction;
    setLocalVote(newVote); // Update UI
    onVote?.(question._id, newVote); // Ensure ID is passed
};


  return (
    <Box
      display="flex"
      alignItems="start"
      gap={2}
      p={2}
      mb={2}
      borderRadius={2}
      boxShadow={2}
      bgcolor="white"
    >
      {/* Voting Section */}
      <Box display="flex" flexDirection="column" alignItems="center">
        <IconButton
          onClick={() => handleVote(1)}
          sx={{
            color: localVote === 1 ? "primary.main" : "gray",
            transition: "color 0.2s ease-in-out",
          }}
        >
          <ArrowDropUp fontSize="large" />
        </IconButton>

        <Typography fontWeight="bold">
          {question.upvotes - question.downvotes}
        </Typography>

        <IconButton
          onClick={() => handleVote(-1)}
          sx={{
            color: localVote === -1 ? "primary.main" : "gray",
            transition: "color 0.2s ease-in-out",
          }}
        >
          <ArrowDropDown fontSize="large" />
        </IconButton>
      </Box>

      {/* Question Details */}
      <Box flex={1}>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={
                question.user.avatar_url ||
                `https://ui-avatars.com/api/?name=${question.user.username}`
              }
            />
            <Box>
              <Typography fontWeight="bold">
                {question.user.username}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(new Date(question.created_at), "MMM d, yyyy")}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center">
            {question.is_pinned && <PushPin color="primary" />}
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => onPin?.(question._id)}>
                <PushPin fontSize="small" />{" "}
                {question.is_pinned ? "Unpin" : "Pin"}
              </MenuItem>
              <MenuItem onClick={() => onEdit?.(question)}>
                <Edit fontSize="small" /> Edit
              </MenuItem>
              <MenuItem onClick={() => onFlag?.(question._id)}>
                <Flag fontSize="small" /> Flag
              </MenuItem>
              <MenuItem onClick={() => onDelete?.(question._id)}>
                <Delete fontSize="small" color="error" /> Delete
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Question Content */}
        <Box mt={1}>
          <Typography color="textSecondary">{question.content}</Typography>
        </Box>

        {/* Actions */}
        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Button startIcon={<ChatBubbleOutline />} color="primary">
            {question.answer_count} answers
          </Button>
          <Button variant="contained" color="primary">
            Answer
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
