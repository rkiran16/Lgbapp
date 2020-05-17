import {
  GET_DATA,
  STORE_CAT_SEARCH,
  FILTERD_POST_CAT,
  OTHER_POST,
  SIMILAR_POST,
  COMMENTS_POST,
  POST_REVIEW,
  SUBMIT_COMMENT,
  CAT_COMMENTS_POST,
  SUBMIT_SAVE_POST,
  GET_NOTIFICATIONS,
  REMOVE_NOTIFICATIONS,
  COMPARE_CONTACTS,
  PHOTO_UPLOAD,
  FETCH_SAVE_POST,
  REMOVE_SAVED_POST,
  STORE_VIEW,
  FOUND_SCHEDULE,
  RFOUND_SCHEDULE, REMOVE_SOCKET_UPDATE,
  APP_STATE, NEW_CONN, NEW_CONN_UPDATE,
} from '../actions/dashboard';


const initialState = {
    socket_newUser: null,
    socket_updateUser:null,
    appState:null,
    category: [],
    commonCategory: [],
    post: [],
    promoPost:[],
    catMenu: [],
    tags: [],
    savedPost:[],
    compareContacts:[],
    storedView:null,
    scheduling:null,
    storedSearch: {
      data: []
    },
    filteredPost: {
      data: [],
      pager: 1,
      item: null,
      error: false
    },
    otherPost: {
      data: [],
      pager: 1,
      user: null,
      error: false
    },
    similarPost: {
      data: [],
      item: null,
      error: false
    },
    commentsPost: {
      data: [],
      pager: 1,
      item: null,
      error: false
    },
    categoryPostComment:{
      data: [],
      pager: 1,
      item: null,
      error: false
    },
    postReview: {
      data: [],
      item: null,
      totalReviews: 0
    },
    notifications: {
      data: [],
    },
    photos: {
      photo: [],
      others: null
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
      case GET_DATA:
        const newlyRetrievedPost = action.post;
        const status = action.status;
        if(!newlyRetrievedPost) {
          return state;
        }
        return {
          ...state,
          category: action.category,
          commonCategory: action.commonCategory,
          post: state.post.concat(newlyRetrievedPost),
          promoPost: action.promoPost,
          catMenu: action.catMenu,
          tags: action.tags
        };
      case FILTERD_POST_CAT:
        let prevData = state.filteredPost.data;
        let post = action.data;
        if(!post){
          return state;
        }
        post = prevData.length > 0 && action.item === state.filteredPost.item ? post.filter(x => !prevData.some(y => (y._id === x._id))) : post;
        return {
          ...state,
          filteredPost: {
            ...state.filteredPost,
            pager: post.length > 0 && action.item === state.filteredPost.item ? state.filteredPost.pager + 1 : 
                  action.item !== state.filteredPost.item && post.length > 0 ? state.filteredPost.pager + 1 :
                  post.length <= 0 && action.item === state.filteredPost.item ? state.filteredPost.pager : 1,
            data: action.item === state.filteredPost.item ? state.filteredPost.data.concat(post) : post,
            error: action.error,
            item: action.item === state.filteredPost.item ? state.filteredPost.item : action.item,
          }
        };
      case SIMILAR_POST:
        let prevSItem = state.similarPost.item;
        let prevSData = state.similarPost.data
        let sData = action.data;
        if(!sData){
          return state;
        }
        sData = prevSData.length > 0 && action.item === prevSItem ? sData.filter(x => !prevSData.some(y => (y._id === x._id))) : sData;
        sData = sData.length > 0 ? sData.filter(x => x._id !== action.current) : sData;
        return {
          ...state,
          similarPost: {
            ...state.similarPost,
            data: action.item === prevSItem ? state.similarPost.data.concat(sData) : sData,
            error: action.error,
            item: action.item === prevSItem ? prevSItem : action.item,
          }
        };
      case COMMENTS_POST:
        let prevCItem = state.commentsPost.item;
        let prevCData = state.commentsPost.data
        let cData = action.data;
        if(!cData){
          return state;
        }
        cData = prevCData.length > 0 && action.item === prevCItem ? cData.filter(x => !prevCData.some(y => (y._id === x._id))) : cData;
        return {
          ...state,
          commentsPost: {
            ...state.commentsPost,
            pager: cData.length > 0 && action.item === prevCItem ? state.commentsPost.pager + 1 : 
                  action.item !== prevCItem && cData.length > 0 ? state.commentsPost.pager + 1 :
                  cData.length <= 0 && action.item === prevCItem ? state.commentsPost.pager : 1,
            data: action.item === prevCItem ? state.commentsPost.data.concat(cData) : cData,
            error: action.error,
            item: action.item === prevCItem ? prevCItem : action.item,
          }
        };
      case CAT_COMMENTS_POST:
        let prevCateItem = state.categoryPostComment.item;
        let prevCateData = state.categoryPostComment.data
        let cateData = action.data;
        if(!cateData){
          return state;
        }
        cateData = prevCateData.length > 0 && prevCateItem===action.item ? cateData.filter(x => !prevCateData.some(y => (y._id === x._id))) : cateData;
        return {
          ...state,
          categoryPostComment: {
            ...state.categoryPostComment,
            pager: cateData.length > 0 && action.item === prevCateItem ? state.categoryPostComment.pager + 1 : 
                  action.item !== prevCateItem && cateData.length > 0 ? state.categoryPostComment.pager + 1 : 
                  cateData.length <= 0 && action.item === prevCateItem ? state.categoryPostComment.pager : 1,
            data: action.item === prevCateItem ? state.categoryPostComment.data.concat(cateData) : cateData,
            error: action.error,
            item: action.item === prevCateItem ? prevCateItem : action.item,
          }
        };
      case SUBMIT_COMMENT:
        return {
          ...state,
          commentsPost: {
            ...state.commentsPost,
            pager: action.item === state.commentsPost.item ? 1 : state.commentsPost.pager
          },
          categoryPostComment:{
            ...state.categoryPostComment,
            pager: action.item === state.categoryPostComment.item ? 1: state.categoryPostComment.pager
          }
        }
      case PHOTO_UPLOAD:
        let uploadPhoto = action.photos; let uploadPhotoData = action.otherData;
        if(!uploadPhoto || uploadPhoto.length <= 0){
          uploadPhoto = [];
          uploadPhotoData = null
        }
        return {
          ...state,
          photos: {
            ...state.photos,
            photo: uploadPhoto,
            others: uploadPhotoData
          },
        }
      case SUBMIT_SAVE_POST:
        if(!action.data){
          return state;
        }
        return {
          ...state,
          savedPost: state.savedPost.concat(action.data),
        };
      case STORE_VIEW:
        return {
          ...state,
          storedView:action.data,
        };
      case NEW_CONN:
        return {
          ...state,
          socket_newUser:action.data,
        };
      case NEW_CONN_UPDATE:
        return {
          ...state,
          socket_updateUser: action.data,
        };
      case REMOVE_SOCKET_UPDATE:
        return{
          ...state,
          socket_updateUser: null
        }
      case FETCH_SAVE_POST:
        if(!action.data){
          return state;
        }
        return {
          ...state,
          savedPost:action.data,
        };
      case REMOVE_NOTIFICATIONS:
        return {
          ...state,
        };
      case FOUND_SCHEDULE:
        return {
          ...state,
          scheduling: action.data
        };
      case RFOUND_SCHEDULE:
        return {
          ...state,
          scheduling: null
        };
      case COMPARE_CONTACTS:
        return {
          ...state,
          compareContacts: action.data
        };  
      case GET_NOTIFICATIONS:
        return {
          ...state,
          notifications: {
            ...state.notifications,
            data:action.data
          }
        };
      case POST_REVIEW:
        let prevx = state.postReview.data;
        let prevxx;
        if(action.item !== state.postReview.item){
          prevxx = action.data;
        }else{
          prevx = new Set(prevx.map(({ _id }) => _id));// const cars1IDs = new Set(cars1.map(({ id }) => id));
          prevxx = [
            ...state.postReview.data,
            ...action.data.filter(({ _id }) => !prevx.has(_id))
          ];
        }
        return{
          ...state,
          postReview: {
            ...state.postReview,
            data: prevxx,
            item: action.item,
            totalReviews: action.total
          } 
        }
      case OTHER_POST:
        let oprevData = state.otherPost.data;
        let opost = action.data;
        if(!opost) {
          return state;
        }
        opost = oprevData.length > 0 && action.user ===state.otherPost.user ? opost.filter(x => !oprevData.some(y => (y._id === x._id))) : opost;
        opost = opost.length > 0 ? opost.filter(x => x._id !== action.item): opost;
        return {
          ...state,
          otherPost: {
            ...state.otherPost,
            pager: opost.length > 0 && action.user === state.otherPost.user ? state.otherPost.pager + 1 : 
                  action.user !== state.otherPost.user && opost.length > 0 ? state.otherPost.pager + 1 :
                  opost.length <= 0 && action.user === state.otherPost.user ? state.otherPost.pager : 1,
            data: action.user === state.otherPost.user ? state.otherPost.data.concat(opost) : opost,
            error: action.error,
            user: action.user === state.otherPost.user ? state.otherPost.user : action.user,
          }
        };
      case STORE_CAT_SEARCH:
        const storeCheck = !action.storedSearch.length ? null : state.storedSearch.data.filter(x => action.storedSearch.find(y => x._id !== y._id));
        return {
          ...state,
          storedSearch:{
            ...state.storedSearch,
            data: !action.storedSearch.length ? state.storedSearch.data : storeCheck.concat(action.storedSearch)
          }
        }
      case REMOVE_SAVED_POST:
        return {
          ...state,
          savedPost: state.savedPost.filter(x => x._id !== action.data)
        };
      case APP_STATE:
        return{
          ...state,
          appState: action.data
        }
    }
    return state;
};