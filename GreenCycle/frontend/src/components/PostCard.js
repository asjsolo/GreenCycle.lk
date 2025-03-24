import React, { useState } from 'react';
import DOMPurify from "dompurify";
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, Typography, IconButton, Menu, MenuItem, Avatar, CardActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import FlagIcon from '@mui/icons-material/Flag';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

export function PostCard({ post, onDelete, onEdit, onFlag }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };


  return (
    <Card sx={{ marginBottom: 2, padding: 2 }}>
      <CardHeader
        avatar={
          <Avatar src={post.user.avatar_url || `https://ui-avatars.com/api/?name=${post.user.username}`} />
        }
        action={
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        }
        title={post.user.username}
        subheader={format(new Date(post.created_at), 'MMM d, yyyy')}
      />

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { onEdit?.(post); handleMenuClose(); }}>
          <EditIcon sx={{ marginRight: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { onFlag?.(post.id); handleMenuClose(); }}>
          <FlagIcon sx={{ marginRight: 1 }} /> Flag
        </MenuItem>
        <MenuItem onClick={() => { onDelete?.(post.id); handleMenuClose(); }} sx={{ color: 'red' }}>
          <DeleteIcon sx={{ marginRight: 1 }} /> Delete
        </MenuItem>

      </Menu>

      <CardContent>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
      </CardContent>

      <CardActions>
        <Button startIcon={<ThumbUpIcon />} size="small">{post.reaction_count}</Button>
        <Button startIcon={<ChatBubbleOutlineIcon />} size="small" onClick={() => setShowComments(!showComments)}>
          {post.comment_count} comments
        </Button>
      </CardActions>

      {showComments && (
        <CardContent sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">Comments coming soon...</Typography>
        </CardContent>
      )}
    </Card>
  );
}
