import POSTS from '../../data/dummy';
import {
  DELETE_POST,
  CREATE_POST,
  UPDATE_POST,
  SET_POSTS,
  GET_CATAG
} from '../actions/posting';

const initialState = {
    availablePosts: [],
    totalPost: 0,
    category: [],
    tags: [],
    userPostPager: 1
};

export default (state = initialState, action) => {
    switch (action.type) {
      case SET_POSTS:
        const posts = action.posts;
        const status = action.status;
        if(!status || status === 304) {
          return state;
        }
        if(posts && state.availablePosts.length > 0 && posts.length > 0 && posts[0]._id === state.availablePosts[0]._id){
          return state;
        }
        if(posts.length > 0){
          return {
            ...state,
            availablePosts: [...state.availablePosts, ...posts],
            totalPost: action.totalPost,
            userPostPager: state.userPostPager + 1
          };
        }
      case GET_CATAG:
          const categori = action.category;
          const catagStatus = action.status;
          if(!catagStatus || catagStatus===304){
            return state;
          }
          if(!categori) {
            return state;
          }
          if(categori && state.category.length > 0 && categori.length > 0 && state.category[0]._id === categori[0]._id){
            return state;
          }
          return {
            ...state,
            category: categori,
            tags: action.tags
          }
      case CREATE_POST:
        const newPost = action.newPost
        if(newPost && newPost._id && newPost.imageUrl) {
          return {
            ...state,
            availablePosts: state.availablePosts.concat(newPost),
          };
        }
      case UPDATE_POST:
        return {
          ...state,
          // availablePosts: updatedAvailablePostts,
        };
      case DELETE_POST:
        return {
          ...state,
          availablePosts: state.availablePosts.filter(
            post => post._id !== action.postID
          ),
          totalPost: state.totalPost - 1
        };
        // return state;
    }
    return state;
};