// import { zodResolver } from '@hookform/resolvers/zod';
// import { FC } from 'react';
// import { useForm } from 'react-hook-form';
// import z from 'zod';
// import postService, { Post } from '../services/post_service';

// const schema = z.object({
//   title: z.string().nonempty('Title is required').min(3),
//   location: z.string().nonempty('Location is required'),
//   image: z.instanceof(FileList).refine((files) => files.length > 0, 'Image is required'),
// });

// type PostFormData = z.infer<typeof schema>;

// const PostForm: FC<{ onPostAdded: (newPost: Post) => void }> = ({ onPostAdded }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<PostFormData>({ resolver: zodResolver(schema) });

//   const onSubmit = async (data: PostFormData) => {
//     try {
//       const formData = new FormData();
//       formData.append('title', data.title);
//       formData.append('location', data.location);
//       formData.append('image', data.image[0]);

//       const newPost = await postService.createPost(formData);
//       onPostAdded(newPost); // עדכון הפוסטים
//       reset(); // איפוס השדות אחרי העלאה מוצלחת
//     } catch (error) {
//       console.error('Failed to create post:', error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="m-3">
//       <div>
//         <label className="form-label" htmlFor="title">
//           Title
//         </label>
//         <input {...register('title')} className="form-control" type="text" id="title" />
//         {errors.title && <p className="text-danger">{errors.title.message}</p>}
//       </div>

//       <div>
//         <label className="form-label mt-2" htmlFor="location">
//           Location
//         </label>
//         <input {...register('location')} className="form-control" type="text" id="location" />
//         {errors.location && <p className="text-danger">{errors.location.message}</p>}
//       </div>

//       <div>
//         <label className="form-label mt-2" htmlFor="image">
//           Upload Image
//         </label>
//         <input {...register('image')} className="form-control" type="file" id="image" />
//         {errors.image && <p className="text-danger">{errors.image.message}</p>}
//       </div>

//       <button className="btn btn-primary mt-3" type="submit">
//         Add Post
//       </button>
//     </form>
//   );
// };

// export default PostForm;
