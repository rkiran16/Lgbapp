import React from 'react';
import { StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity, Dimensions } from 'react-native';
import { withNavigation } from 'react-navigation';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Rating } from 'react-native-elements';
import { Block, Text, theme } from 'galio-framework';
import { Odb } from "../actionable";
import { argonTheme } from '../constants';
const { width } = Dimensions.get("screen");


class Card extends React.Component {
  reviewAccum = (arr) => {
    if(!arr) {
      return 0;
    }
    if(arr){
      // const sum = arr.map( el => parseInt(el.review) ).reduce((a, b) => a + b, 0);
      const sums = arr.reviews/arr.users;
      return sums;
    }
    return 0;
  }
  render() {
    const { actionFn, cart, item, horizontal, full, style, ctaColor, imageStyle, order, saved, shop } = this.props;
    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle
    ];
    const cardContainer = [styles.shadow, style, cart || order || saved ? {...styles.card, marginBottom:0} : styles.card ];
    const imgContainer = [styles.imageContainer,
      horizontal ? {...styles.horizontalStyles, flex: order? 0.4:0.6} : styles.verticalStyles,
      imageStyle
    ];
    const { title, imageUrl, price, creator, discount, shortdesc, review, qty, time } = item.post || item;
    const { bizname, displayName } = creator
    const ratings = review;

    return (
      <Block flex style={cardContainer}>
        <TouchableWithoutFeedback onPress={actionFn}>
          <Block flex={1} row={horizontal} card>
          <Block style={imgContainer}>
            <Image source={{uri: Odb.dbUrl + imageUrl[0]}} style={imageStyles} />
            {
              order ? null :
              !discount ? null :
              <Block style={styles.discountDot}>
                <Text style={{...styles.textHeader, color:'black', fontSize:8}}>{`${discount}% off`}</Text>
                {/* <Text style={{fontFamily:'bold', color:'white', fontSize:6}}>off</Text> */}
              </Block>
            }
          </Block>
          <Block flex={1} style={{...styles.cardDescription}}>
            <Block flex={0.33}>
            {
              order || saved ?
              <Text numberOfLines={1} style={{...styles.cardTitle, fontSize:18}}>{title}</Text> : null
            }
            {
              cart ?
              <Text numberOfLines={2} style={{...styles.cardTitle, fontSize:14}}>{title}</Text> : null
            }
            {
              shop ? 
              <Text numberOfLines={1} style={{...styles.cardTitle, fontSize:13}}>{title}</Text>: null
            }
            </Block>
            {
              order ? 
              <Block space="between" flex={0.67}>
                <Block row space="between">
                  <Block flex={0.5} row>
                    <Text style={{...styles.textHeader, color: argonTheme.COLORS.GRADIENT_START}}>Order#: </Text>
                    <Text numberOfLines={1} style={styles.textResponse}>{item._id}</Text>
                  </Block>
                  <Block flex={0.5} row style={{justifyContent:'flex-end'}}>
                    <Text style={{...styles.textHeader, color: argonTheme.COLORS.GRADIENT_START}}>Qty: </Text>
                    <Text style={styles.textResponse}>{item.qty}</Text>
                  </Block>
                </Block>
                <Block row space='between'>
                  <Block row space='between'>
                    <Text style={{...styles.textHeader, color: argonTheme.COLORS.GRADIENT_START}}>Status: </Text>
                    <Text style={styles.textResponse}>{item.status}</Text>
                  </Block>
                  <Block row space='between'>
                    <Text style={{...styles.textHeader, color: argonTheme.COLORS.GRADIENT_START}}>Date: </Text>
                    <Text style={styles.textResponse}>{moment(item.updatedAt).format("MMM Do, YYYY")}</Text>
                  </Block>
                </Block>
                <Block row space="between">
                  <TouchableOpacity onPress={actionFn}>
                    <Block>
                      <Text style={{fontFamily:'bold', color:argonTheme.COLORS.ACTIVE, fontSize: 14}}>More Options...</Text>
                    </Block>
                  </TouchableOpacity>
                  <Rating
                    type='star'
                    ratingColor='#6B24AA'
                    ratingCount={5}
                    imageSize = {15}
                    startingValue={this.reviewAccum(ratings)}
                    readonly
                  />
                </Block>
              </Block> : null
            }
            {
              cart ? 
              <Block space="between" flex={0.67}>
                <Block row space="between" style={{marginBottom:10}}>
                  <Block flex={0.4} row>
                    <Text style={{...styles.textHeader, color: argonTheme.COLORS.GRADIENT_START}}>Qty: </Text>
                    <Text style={styles.textResponse}>{qty}</Text>
                  </Block>
                  <Block flex={0.5} style={{alignItems:'flex-end'}}>
                    <Block row flex={1}>
                      <Text style={{...styles.textHeader, color: argonTheme.COLORS.GRADIENT_START}}>Merchant: </Text>
                      <Text style={{...styles.textResponse}}>{bizname || displayName}</Text>
                    </Block>
                  </Block>
                </Block>
                <Block row style={{marginBottom:10}}>
                    <Text style={{...styles.textHeader, color: argonTheme.COLORS.GRADIENT_START}}>For: </Text>
                    <Text style={{...styles.textResponse}}>{time}</Text>
                  </Block>
                <Block row space="between">
                  <Block>
                    <Text style={{fontFamily:'bold', color:argonTheme.COLORS.SWITCH_ON, fontSize: 14}}>{`Price: ${price}`}</Text>
                  </Block>
                  <Rating
                    type='star'
                    ratingColor='#6B24AA'
                    ratingCount={5}
                    imageSize = {15}
                    startingValue={this.reviewAccum(ratings)}
                    readonly
                  />
                </Block>
              </Block> : null
            }
            {
              shop ?
                <Block space="between" flex={horizontal ? 0.67 : null}>
                  {
                    horizontal ?
                    <Block>
                      <Text numberOfLines={5} style={{fontFamily:'regular', fontSize:12, color:'#999999',textAlign:'justify'}}>
                        {shortdesc || null}
                      </Text>
                    </Block>:null
                  } 
                  <Block row space="between">
                    {
                      !item.price && !ratings ? 
                        <Block style={{}}>
                          <Text numberOfLines={1} style={{fontSize:12, fontFamily:'regular', color:'#999999'}}>{shortdesc}</Text>
                        </Block> : null
                    }

                    <Block style={{}}>
                      {
                        !item.price ? null :
                        <Text style={{fontFamily:'bold', color:argonTheme.COLORS.SWITCH_ON, fontSize: 12}}>{`Price: ${price}`}</Text>
                      }
                    </Block>
                    {
                      !ratings ? null :
                      <Block style={{justifyContent:'center'}}>
                        <Rating
                          type='star'
                          ratingColor='#6B24AA'
                          ratingCount={5}
                          imageSize = {10}
                          startingValue={this.reviewAccum(ratings)}
                          readonly
                        />
                      </Block>
                    }
                  </Block>
                </Block> : null
            }
            {
              saved ? 
              <Block space="between" flex={0.67}>
                <Block>
                  <Text numberOfLines={3} style={{fontFamily:'regular', fontSize:12, color: argonTheme.COLORS.BLACKS}}>
                    {shortdesc || null}
                  </Text>
                </Block>
                <Block row space="between">
                  <Block>
                    <Text style={{fontFamily:'bold', color:argonTheme.COLORS.SWITCH_ON, fontSize: 14}}>{`Price: ${price}`}</Text>
                  </Block>
                  <Block>
                    <Rating
                      type='star'
                      ratingColor='#6B24AA'
                      ratingCount={5}
                      imageSize = {15}
                      startingValue={this.reviewAccum(ratings)}
                      readonly
                    />
                  </Block>
                </Block>
              </Block> : null
            }
          </Block>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

Card.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 118,
    height: 118,
    marginBottom: 16
  },
  cardTitle: {
    flex: 1,
    flexWrap: 'wrap',
    paddingBottom: 6,
    fontFamily: 'bold', 
    fontSize: 16,
    color: argonTheme.COLORS.HEADER
  },
  textHeader: {
    fontFamily: 'bold',
    fontSize: 13,
    color:argonTheme.COLORS.BLACKS,
  },
  textResponse: {
    fontFamily: 'regular',
    fontSize: 13,
    color:argonTheme.COLORS.BLACK,
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
    justifyContent: 'space-between'
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  image: {
    // borderRadius: 3,
  },
  horizontalImage: {
    height: 122,
    width: width*0.4,
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    // flex:0.6
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  fullImage: {
    height: 215
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  discountDot: {
    position:'absolute', 
    top: 6, left:6, height:16, 
    width:42, borderRadius:2, 
    backgroundColor:argonTheme.COLORS.WARNING, 
    justifyContent:'center', 
    alignItems:'center'
  },
});

export default withNavigation(Card);