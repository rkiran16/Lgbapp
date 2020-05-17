import * as URL from '../../actionable/Onboard';
export const MISC_INCREASE = 'MISC_INCREASE';
export const SET_VIEW_ITEM = 'SET_VIEW_ITEM';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const ADD_CART_ITEM = 'ADD_CART_ITEM';
export const FETCH_ORDERS = 'FETCH_ORDERS';
export const EMPTY_CART = 'EMPTY_CART';
export const FETCHED_REVIEW = 'FETCHED_REVIEW';
export const SUBMITS_REVIEW = 'SUBMITS_REVIEW';
export const FETCHED_REWARD = 'FETCHED_REWARD';


export const miscIncrease = (req, item) => {
  if(!req || !item){
    return;
  }
  return async dispatch => {
    dispatch({ type: MISC_INCREASE, data:req, item:item});
  };
};

export const viewItem = async(x) => {
  return async dispatch => {
    if(!x){
      return;
    }else {
      dispatch({ type: SET_VIEW_ITEM, data:x});
    }
  };
}

export const removeItem = (x) => {
  return async dispatch => {
    if(!x){
      return;
    }else {
      dispatch({ type: REMOVE_FROM_CART, data:x});
    }
  };
}

export const emptyCart = () => {
  return async dispatch => {
      dispatch({ type: EMPTY_CART});
  };
}

export const addCartItem = (x,y) => {
  // console.log(x);
  return dispatch => {
    if(!x){
      return;
    }else {
      const xs = {...x, qty: 1, time: !y?'n/a':y}
      dispatch({ type: ADD_CART_ITEM, data:xs});
    }
  };
}

export const fetchOrders= (pager) => {
  return async dispatch => {
      try {
          const formData = new FormData();
          formData.append('pager', pager);
          const resData = await URL.dbSubmitUrl('m/fetchorders', formData);
          if(!resData){
              dispatch({ type: FETCH_ORDERS, error: true, data:[], item:cat});
          }
          dispatch({ type: FETCH_ORDERS, error: false, data:resData.order, total:resData.total, pager: resData.order.length > 0 ? 1:0});
      } catch (err) {
        throw err;
      }
  };
};

export const productsReviews = (pager, cat) => {
  console.log(cat);
  console.log('fetching reviews');
  return async dispatch => {
    // any async code you want!
    try {
        const formData = new FormData();
        formData.append('pager', pager);
        formData.append('cat', cat);
        const resData = await URL.dbSubmitUrl('m/fetchreviews', formData);
        console.log('finishedfetchingreviews')
        dispatch({ type: FETCHED_REVIEW, error: false, data:resData.review, item:cat, total:resData.totalItems});
    } catch (err) {
        throw err;
    }
  };
};

export const submitReviews = (ww,xx,yy,zz) => {
  return async dispatch => {
    console.log('submitting reviews')
    // any async code you want!
    try {
        const formData = new FormData();
        formData.append('review', ww);
        formData.append('text', xx);
        formData.append('order', yy);
        formData.append('post', zz);
        await URL.dbSubmitUrl('m/postreview', formData);
    } catch (err) {
        throw err;
    }
  };
};



export const fetchRewards = (x) => {
  console.log('startingrewards')
  return async dispatch => {
    // any async code you want!
    try {
        const formData = new FormData();
        formData.append('pager', x);
        const resData = await URL.dbSubmitUrl('m/fetchrewards', formData);
        console.log('finishedrewards')
        dispatch({ type: FETCHED_REWARD, data:resData.reward, total: resData.total, pager: x});
    } catch (err) {
        throw err;
    }
  };
}



