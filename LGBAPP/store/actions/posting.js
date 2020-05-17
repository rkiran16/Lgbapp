import { AsyncStorage } from 'react-native';
import Post from '../../models/posting';
import * as URL from '../../actionable/Onboard'

export const EXISTING_POST = 'EXISTING_POST';
export const CREATE_POST = 'CREATE_POST';
export const DELETE_POST = 'DELETE_POST';
export const UPDATE_POST = 'UPDATE_POST';
export const SET_POSTS = 'SET_POSTS';
export const TOTAL_USERPOST = 'TOTAL_USERPOST';
export const GET_CATAG = 'GET_CATAG';

export const fetchcatags = () => {
    let rToken;
    setTimeout(() => {
      console.log('Go');
    }, 3000)
    return async dispatch => {
      // any async code you want!
      try {
        const value = await AsyncStorage.getItem('user');
        if (!value) {
          throw new Error('Something went wrong!');
        }
        rToken = await JSON.parse(value);

        const response = await fetch(
            `${URL.dbUrl}m/catagprefill`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + rToken.stoken
                }
            }
        );
        
        if (response.status !== 200) {
          if(response.status === 304) {
            return true;
          }
          throw new Error('Something went wrong!');
        }
  
        const resData = await response.json();
        if (!resData || resData === null || resData === undefined) {
            throw new Error('Something went wrong!');
        }

        dispatch({ type: GET_CATAG, category: resData.category, tags: resData.tags, status:response.status });
      } catch (err) {
            console.log(err);
        throw err;
      }
    };
};

export const fetchPosts = pager => {
    let rToken;
    return async dispatch => {
      // any async code you want!
      try {
        const value = await AsyncStorage.getItem('user');
        if (!value) {
          throw new Error('Something went wrong!');
        }
        rToken = await JSON.parse(value);
        const response = await fetch(
            `${URL.dbUrl}m/getuserposts?page=${pager}`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + rToken.stoken
                }
            }
        );

        if (response.status !== 200) {
          console.log(response.status);
          if(response.status === 304) {
            
          } else {
            throw new Error('Something went wrong!');
          }
        }
  
        const resData = await response.json();
        if (!resData || resData === null || resData === undefined) {
          throw new Error('Something went wrong!');
        }
        
        dispatch({ type: SET_POSTS, posts: resData.posts, totalPost: resData.totalItems, status:response.status });
      } catch (err) {
            console.log(err);
        throw err;
      }
    };
};

const stringLength = data => {
  const rData = data && data.split('|')[0].trim() ? data.split('|')[0].trim() : null;
  return rData;
}

const getAllPhotos = fdata => {
  const photoName = fdata.split('/');
  let pImage = fdata.split('.');
  pImage = fdata.split('.')[pImage.length -1];
  const photoImg = new Object();

  if(pImage === 'jpg'){
    photoImg.type = `image/${pImage}`;
  }
  else if(pImage === 'jpeg') {
    photoImg.type = `image/${pImage}`;
  }
  else if(pImage === 'png') {
    photoImg.type = `image/${pImage}`;
  } else {
    photoImg.type = `video/${pImage}`;
  }

  photoImg.uri = fdata;
  photoImg.name = fdata.split('/')[photoName.length -1];
  return photoImg;
}

export const createPost=(formDatas) => {
  let rToken;
  const nTags = [];

  formDatas.nTag.forEach(el => nTags.push(stringLength(el)));
  
  let photoImg = [];
  formDatas.rUpload.forEach(el => photoImg.push(getAllPhotos(el)));

  // let photoImgs = (photoImg) => Object.assign({}, photoImg.map(item => ({'imgURL': item})));
  // photoImgs = photoImgs(photoImg);
  const formData = new FormData();
  photoImg.forEach(el => formData.append('imgURL', el))
  formData.append('postID', formDatas.postID);
  formData.append('category', formDatas.nInterest);
  formData.append('title', formDatas.ntitle);
  formData.append('stype', formDatas.stype);
  formData.append('kategorization', formDatas.kategorization);
  formData.append('nshort', formDatas.nshort);
  formData.append('nDesc', formDatas.nDesc);
  formData.append('nprice', formDatas.nprice);
  formData.append('nDiscount', formDatas.nDiscount);
  formData.append('nlink', formDatas.nlink);
  formData.append('nButton', formDatas.nButton);
  formData.append('nAction', formDatas.nAction);
  formData.append('nTag', JSON.stringify(nTags));
  formData.append('regionLong', formDatas.region.longitude);
  formData.append('regionLat', formDatas.region.latitude);
  return async dispatch => {
    // any async code you want!
    try {
      const value = await AsyncStorage.getItem('user');
      if (!value) {
        throw new Error('Something went wrong!');
      }

      rToken = await JSON.parse(value);

      const response = await fetch(
        `${URL.dbUrl}m/post`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + rToken.stoken 
          }
        }
      );

      if (response.status !== 201) {
        const resp = await response.json();
        const error = new Error(resp.message);
        error.status = response.status;
        throw error;
      }
      
      const resData = await response.json();
      dispatch({ type: CREATE_POST, newPost:resData.post });
    } catch (err) {
      throw err;
    }
  };
};

export const deleteUserPosts = postID => {

  const formData = new FormData();
  formData.append('postID', postID);
  console.log(postID);
  return async dispatch => {
    // any async code you want!
    try {
      
      const value = await AsyncStorage.getItem('user');
      if (!value) {
        throw new Error('Something went wrong!');
      }

      rToken = await JSON.parse(value);

      const response = await fetch(
        `${URL.dbUrl}m/deleteuserposts`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + rToken.stoken 
          }
        }
      );

      if (response.status !== 200) {
        const resp = await response.json();
        const error = new Error(resp.message);
        error.status = response.status;
        throw error;
      }
      
      const resData = await response.json();

      dispatch({ type: DELETE_POST, postID:postID });
    } catch (err) {
      throw err;
    }
  };
};

export const updatePost = (_id, category, title, shortdesc, description, price, discount, imageUrl, type, tag) => {
    return async dispatch => {
        try {
            const response = await fetch(
                `${URL.dbUrl}m/updatepost`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    _id,
                    category,
                    title,
                    shortdesc,
                    description,
                    price,
                    discount,
                    imageUrl,
                    type,
                    tag
                  })
                }
              );
          
              if (response.status !== 200) {
                throw new Error('Something went wrong!');
              }
          
              dispatch({
                type: UPDATE_POST,
                pid: _id,
                postData: {
                  category,
                  title,
                  shortdesc,
                  description,
                  price,
                  discount,
                  imageUrl,
                  type,
                  tag
                }
              });
        } catch(err) {
            console.log(err);
            throw err;
        }
    };
  };