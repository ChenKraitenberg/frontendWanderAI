// import { FC, useEffect, useState } from 'react';
// import postService, { Post } from '../services/post_service';

// const PostsList: FC = () => {
//   const [posts, setPosts] = useState<Post[]>([]);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const { request } = postService.getPosts();
//         const response = await request;
//         setPosts(response.data);
//       } catch (error) {
//         console.error('Failed to fetch posts:', error);
//       }
//     };

//     fetchPosts();
//   }, []);

//   return (
//     <div className="row">
//       {posts.map((post) => (
//         <div key={post._id} className="col-12 mb-4">
//           <div className="card">
//             <div className="card-header d-flex align-items-center">
//               <img src={post.user?.avatar || '/default-avatar.png'} alt="User Avatar" className="rounded-circle" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
//               <div>
//                 <h6 className="mb-0">{post.user?.name || 'Unknown User'}</h6>
//                 <small className="text-muted">{post.date}</small>
//               </div>
//             </div>
//             <div className="card-body">
//               <p>{post.description}</p>
//               {post.image && <img src={post.image} alt="Post Image" className="img-fluid rounded" style={{ maxHeight: '300px', objectFit: 'cover' }} />}
//             </div>
//             <div className="card-footer d-flex justify-content-between">
//               <button className="btn btn-outline-primary">❤️ {post.likes} Likes</button>
//               <button className="btn btn-outline-secondary">💬 {post.comments?.length || 0} Comments</button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default PostsList;
