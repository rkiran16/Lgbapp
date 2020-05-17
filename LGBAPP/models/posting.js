import moment from 'moment';
class Posting {
    constructor(_id,category,creator,title,shortdesc,description,price,discount,imageUrl,postType,tags,unlisted,createdAt, ) {
      this._id = _id;
      this.category = category;
      this.creator = creator;
      this.title = title;
      this.shortdesc = shortdesc
      this.description = description;
      this.price = price;
      this.discount = discount;
      this.imageUrl = imageUrl;
      this.postType = postType;
      this.tags = tags;
      this.unlisted = unlisted;
      this.createdAt = createdAt
    }

    get readableDate() {
        //   return this.date.toLocaleDateString('en-EN', {
        //       year: 'numeric',
        //       month: 'long',
        //       day: 'numeric',
        //       hour: '2-digit',
        //       minute: '2-digit'
        //   });

        //moment().format('MMMM Do YYYY, h:mm:ss a')
        return moment(this.createdAt).format('MMMM Do YYYY, hh:mm');
    }
  }
  
  export default Posting;