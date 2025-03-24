import React, { useEffect, useState } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Paper,
} from "@mui/material";
import { Edit as EditIcon, Help as HelpIcon } from "@mui/icons-material";
import { PostCard } from "./components/PostCard";
import QuestionCard from "./components/QuestionCard";
import CreatePostForm from "./components/CreatePostForm"
import EditPostForm from "./components/EditPostForm";
import axios from 'axios';
import AskQuestionForm from "./components/AddQuestionForm";


// Temporary mock data
// const mockPosts = [
//   {
//     id: "1",
//     content:
//       "React and TypeScript make a powerful combination for building robust web applications...",
//     user_id: "1",
//     created_at: new Date().toISOString(),
//     comment_count: 5,
//     reaction_count: 12,
//     user: {
//       id: "1",
//       email: "john@example.com",
//       username: "John Doe",
//       avatar_url:
//         "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
//     },
//   },
// ];

const user_id = "677145c5e089439fefce8fbf";
// const mockQuestions = [
//   {
//     id: "1",
//     title: "How do I implement authentication in React?",
//     content:
//       "I'm building a React application and need to implement user authentication...",
//     user_id: "2",
//     created_at: new Date().toISOString(),
//     answer_count: 3,
//     upvotes: 8,
//     downvotes: 2,
//     is_pinned: true,
//     user: {
//       id: "2",
//       email: "jane@example.com",
//       username: "Jane Smith",
//       avatar_url:
//         "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
//     },
//   },
// ];

function App() {
  const [activeTab, setActiveTab] = useState("posts");
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [askQuestionDialogOpen, setAskQuestionDialogOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchQuestions();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/post");
      const data = await response.json();
      
      if (Array.isArray(data.data)) {
        const transformedPosts = data.data.map(post => ({
            id: post.id,
            content: post.content,
            user_id: post.user_id,
            created_at: post.created_at,
            comment_count: Array.isArray(post.CommentId) ? post.CommentId.length : 0,
            reaction_count: Array.isArray(post.favoritedBy) ? post.favoritedBy.length : 0,
            user: {
                id: post.user_id,
                email: "john@example.com",
                username: "John Doe",
                avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
            }
        }));

        setPosts(transformedPosts);
      } else {
        console.error("Unexpected response format:", data);
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
  
      const response = await fetch(`http://localhost:3001/api/deletepost?postId=${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
      
      if (response.ok) {
        fetchPosts();
      } else {
        console.error("Error deleting post:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  
  
  const handleOpenPostDialog = () => setPostDialogOpen(true);
  const handleClosePostDialog = () => setPostDialogOpen(false);

  const handlePostSubmit = async (content) => {
    console.log("content: ", content);
    const response = await fetch("http://localhost:3001/api/create-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author: user_id }),
    });
  
    const data = await response.json();
    if (response.ok) {
      fetchPosts();
      setPostDialogOpen(false);
    } else {
      console.error("Error creating post:", data);
    }
  };

  const handleOpenEditDialog = (post) => {
    setCurrentPost(post);
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentPost(null);
  };
  
  const handleUpdatePost = async (postId, updatedContent) => {
    try {
      const response = await fetch(`http://localhost:3001/api/updatepost?postId=${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updatedContent }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        fetchPosts(); // Refresh posts after update
        handleCloseEditDialog();
      } else {
        console.error("Error updating post:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const fetchQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/get-allQuestion?userId=${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      // Check if the response is valid JSON
      const text = await response.text();
      try {
        const data = JSON.parse(text);
  
        if (Array.isArray(data.data)) {
          const transformedQuestions = data.data.map((question) => ({
            id: question._id,
            title: question.title,
            content: question.content,
            user_id: question.author,
            created_at: question.createdAt,
            answer_count: Array.isArray(question.answers) ? question.answers.length : 0,
            upvotes: question.upvotes || 0,
            downvotes: question.downvotes || 0,
            totalVotes: (question.upvotes || 0) - (question.downvotes || 0),
            is_pinned: question.isPinned || false,
            userVote: question.userVote || 0, // 1 = upvote, -1 = downvote, 0 = no vote
            user: {
              username: "John Doe",
              avatar_url:
           "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
            },
            answers: question.answers || [], // Array of answers
          }));
  
          setQuestions(transformedQuestions);
        } else {
          console.error("Unexpected response format:", data);
          setQuestions([]);
        }
      } catch (jsonError) {
        console.error("Response is not valid JSON:", text);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };
  
  
  
  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(`http://localhost:3001/api/delete-question?questionId=${questionId}`);
        fetchQuestions();
      } catch (error) {
        console.error("Error deleting question", error);
      }
    }
  };
  
  const handlePinQuestion = async (questionId) => {
    try {
      await axios.post(`http://localhost:3001/api/pinned-Question?questionId=${questionId}`);
      fetchQuestions();
    } catch (error) {
      console.error("Error pinning/unpinning question", error);
    }
  };
  
  const handleVote = async (questionId, voteType) => {
    if (![1, -1].includes(voteType)) return; // Prevent sending invalid votes
    try {
        const response = await axios.post("http://localhost:3001/api/add-vote", {
            questionId,
            userId: user_id,
            voteType
        });

        const { upvotes, downvotes } = response.data;
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? { ...q, upvotes, downvotes, userVote: voteType }
                    : q
            )
        );
    } catch (error) {
        console.error("Error voting:", error.response?.data || error);
    }
};


  

  const handleAskQuestionDialogOpen = () => setAskQuestionDialogOpen(true);
  const handleAskQuestionDialogClose = () => setAskQuestionDialogOpen(false);

  const handleAskQuestionSubmit = async (questionData) => {
    try {
      const response = await fetch("http://localhost:3001/api/create-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: user_id,
        content: questionData.content, 
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        fetchQuestions();
        setAskQuestionDialogOpen(false); 
      } else {
        console.error("Error creating question:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Community
          </Typography>
          {activeTab === "posts" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              sx={{ mr: 2 }}
              onClick={handleOpenPostDialog}
            >
              Create Post
            </Button>
          )}
          {activeTab === "questions" && (
            <Button
              variant="contained"
              color="success"
              startIcon={<HelpIcon />}
              onClick={handleAskQuestionDialogOpen}
            >
              Ask Question
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
          >
            <Tab label="Posts" value="posts" />
            <Tab label="Questions" value="questions" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>
          {activeTab === "posts"
            ? posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                  onEdit={handleOpenEditDialog}
                  onFlag={(id) => console.log("Flag post:", id)}
                />
              ))
            : questions
            .sort((a, b) => (b.isPinned ? 1 : -1)) // Show pinned questions first
            .map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onDelete={() => handleDeleteQuestion(question.id)}
                onEdit={() => console.log("Edit question:", question)}
                onPin={() => handlePinQuestion(question.id)}
                onVote={(voteType) => handleVote(question.id, voteType)}
              />
            ))}
        </Box>
      </Container>

      {/* Create Post Form Component */}
      <CreatePostForm open={postDialogOpen} onClose={handleClosePostDialog} onSubmit={handlePostSubmit} />

      <EditPostForm
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        post={currentPost}
        onSubmit={(updatedContent) => handleUpdatePost(currentPost.id, updatedContent)}
      />

      {/* Ask Question Form Component */}
      <AskQuestionForm
        open={askQuestionDialogOpen}
        onClose={handleAskQuestionDialogClose}
        onSubmit={handleAskQuestionSubmit} // Pass submit handler to form
      />
    </Box>
  );
}

export default App;
