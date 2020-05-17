import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Block, Text} from 'galio-framework';
import PropTypes from 'prop-types';
import argonTheme from '../constants/Theme';

export default class RadioButtons extends Component {
	state = {
		value: null,
    };
    
    handleOnChange = (value) => {
        const { onChange } = this.props;
        onChange && onChange(value);
    }

	render() {
		const { options, column, cube, labelStyle } = this.props;
        const { value } = this.state;
        
        const radioStyles = [
            !column && styles.viewDirection,
        ];

		return (
			<Block style={radioStyles}>
				{options.map((item,index) => {
					return (
						<Block key={index} style={styles.buttonContainer}>
							<TouchableOpacity
								onPress={() => this.handleOnChange(value)}
								onPressIn={() => {
									this.setState({
										value: item.value,
									});
								}}
							><Text style={labelStyle || styles.labelStyle}>{item.label}</Text></TouchableOpacity>
							<TouchableOpacity
                                onPress={() => this.handleOnChange(value)}
								style={cube ? styles.cube : styles.circle}
								onPressIn={() => {
									this.setState({
										value: item.value,
									});
								}}
							>
								{value === item.value && <Block style={cube ? styles.checkedCube : styles.checkedCircle} />}
							</TouchableOpacity>
						</Block>
					);
				})}
			</Block>
		);
	}
}

RadioButtons.defaultProps = {
    column: false,
    cube: false,
    onChange: () => {},
    labelStyle: null
    // error: false
  };
  
  RadioButtons.propTypes = {
    column: PropTypes.bool,
    cube: PropTypes.bool,
    onChange: PropTypes.func,
    labelStyle: PropTypes.object,
    // error: PropTypes.bool
  }

const styles = StyleSheet.create({
	// container: {
	// 	flex: 1,
	// 	flexWrap: "wrap",
	// 	alignContent:'space-between'
	// },
    viewDirection: {
        flex: 1,
        flexDirection: 'row',
		flexWrap: "wrap",
		
    },
    labelStyle: {
        fontFamily:'regular',
        fontSize: 18,
        color: argonTheme.COLORS.BLACKS,
        marginRight: 10,
    },
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 30,
		marginRight: 20,
	},
	circle: {
		height: 20,
		width: 20,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: argonTheme.COLORS.BLACKS,
		alignItems: 'center',
		justifyContent: 'center',
    },
    cube: {
		height: 20,
		width: 20,
		borderWidth: 1,
		borderColor: argonTheme.COLORS.BLACKS,
		alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    checkedCircle: {
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: argonTheme.COLORS.GRADIENT_START,
	},
	checkedCube: {
		width: 14,
        height: 14,
        borderRadius: 2,
		backgroundColor: argonTheme.COLORS.GRADIENT_START,
	},
});