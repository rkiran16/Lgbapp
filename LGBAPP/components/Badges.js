import React from 'react';
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Tooltip, Text } from 'react-native-elements';
import { Block, Text as Texts, theme } from 'galio-framework';

import { argonTheme } from '../constants';
const { height, width } = Dimensions.get('screen');
class Badges extends React.Component {
    render(){
        const tips = [
            'Identify your post for indexing',
            'This helps in grouping your post, e.g. under Food, events nearby, etc',
            'If your post is personal you may ignore. If Business select appropriate',
            'Short and concise title for your post',
            'Provide short description'
        ]
        const {bColor, tip, tops } = this.props;
        const badgeStyles = [
            {...styles.discountDot},
            bColor ? { backgroundColor:argonTheme.COLORS.BLUE } : null,
            tops && Platform.OS==='android' ? {top: -6} : null
          ];
        return (
            <Block style={badgeStyles} >
                <Tooltip ref={tip} popover={
                    <Text style={{fontFamily:'regular', fontSize:10, color:'white'}}>{tips[tip]}</Text>
                } 
                containerStyle={{flexWrap:'wrap', width:width*0.7, height:'auto'}}>
                    <Block style={{flex:1, width:12, height:12, backgroundColor:'transparent', alignItems:'center'}} >
                        <Texts style={{fontFamily:'bold', color:'white', fontSize:10}}>i</Texts>
                    </Block>
                </Tooltip>
            </Block>
        );
    };
}

const styles = StyleSheet.create({
    discountDot: {
        position:'absolute', 
        top: -12, left:1, height:12, 
        width:12, borderRadius:6, 
        backgroundColor:'red', 
        justifyContent:'center', 
        alignItems:'center',
        zIndex:900000
    },
});

export default Badges;