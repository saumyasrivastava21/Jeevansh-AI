import { apiFetch } from './api';

export interface AuthorRef {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin' | string;
}

export interface Post {
  _id: string;
  author: AuthorRef;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likesCount: number;
  isLiked: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  author: AuthorRef;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  pages: number;
}

export const communityApi = {
  // Fetch posts with optional filter/search/pagination
  getPosts: async (params: {
    category?: string;
    search?: string;
    tag?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PostsResponse> => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.tag) query.set('tag', params.tag);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const queryString = query.toString();
    const endpoint = queryString ? `/community/posts?${queryString}` : '/community/posts';
    const res = await apiFetch(endpoint);
    return res.data;
  },

  // Get single post
  getPostById: async (id: string): Promise<Post> => {
    const res = await apiFetch(`/community/posts/${id}`);
    return res.data;
  },

  // Create new post
  createPost: async (data: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
  }): Promise<Post> => {
    const res = await apiFetch('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // Update post
  updatePost: async (
    id: string,
    data: { title?: string; content?: string; category?: string; tags?: string[] }
  ): Promise<Post> => {
    const res = await apiFetch(`/community/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // Delete post
  deletePost: async (id: string): Promise<void> => {
    await apiFetch(`/community/posts/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle like
  toggleLike: async (id: string): Promise<{ likesCount: number; isLiked: boolean }> => {
    const res = await apiFetch(`/community/posts/${id}/like`, {
      method: 'POST',
    });
    return res.data;
  },

  // Get comments for a post
  getComments: async (postId: string): Promise<Comment[]> => {
    const res = await apiFetch(`/community/posts/${postId}/comments`);
    return res.data || [];
  },

  // Add comment
  createComment: async (postId: string, content: string): Promise<Comment> => {
    const res = await apiFetch(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return res.data;
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<void> => {
    await apiFetch(`/community/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};
