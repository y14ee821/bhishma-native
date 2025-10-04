import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

// Simple Flash Icon using SVG (requires react-native-svg)
import Svg, { Path } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';

const FlashIcon = ({ color = '#007AFF', size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M7 2v11h3v9l7-12h-4l4-8z"
            fill={color}
        />
    </Svg>
);

// Simple Home and Control Icons using SVG
const HomeIcon = ({ color = '#007AFF', size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 10.5V21a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V10.5a1 1 0 00-.293-.707l-8-8a1 1 0 00-1.414 0l-8 8A1 1 0 003 10.5z"
            fill={color}
        />
    </Svg>
);

const ControlIcon = ({ color = '#007AFF', size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M4 13h16v-2H4v2zm0 5h10v-2H4v2zm0-10h7V6H4v2z"
            fill={color}
        />
    </Svg>
);

const NavBar = ({ current, onNavigate, darkMode, onToggleTheme }) => {
    const { width } = useWindowDimensions();
    // Thresholds: <600 = mobile, <900 = laptop, else desktop
    const showIcons = width < 900;

    return (
        <View style={[styles.navBar, darkMode && styles.navBarDark]}>
            <View style={styles.appNameContainer}>
                <FlashIcon color={darkMode ? '#fff' : '#007AFF'} size={26} />
                <Text style={[styles.appName, darkMode && styles.appNameDark]}>Remcon</Text>
            </View>
            <View style={styles.navLinks}>
                <TouchableOpacity onPress={() => onNavigate('Home')}>
                    {showIcons ? (
                        <HomeIcon color={current === 'Home' ? '#007AFF' : darkMode ? '#fff' : '#444'} size={24} />
                    ) : (
                        <Text style={[
                            styles.navLink,
                            current === 'Home' && styles.navLinkActive,
                            darkMode && styles.navLinkDark
                        ]}>Home</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onNavigate('Control')}>
                    {showIcons ? (
                        <ControlIcon color={current === 'Control' ? '#007AFF' : darkMode ? '#fff' : '#444'} size={24} />
                    ) : (
                        <Text style={[
                            styles.navLink,
                            current === 'Control' && styles.navLinkActive,
                            darkMode && styles.navLinkDark
                        ]}>Control</Text>
                    )}
                </TouchableOpacity>
                
            </View>
            <Switch value={darkMode} onValueChange={onToggleTheme} />
        </View>
    );
};

export const HomeScreen = ({ navigation }) => {
    const [darkMode, setDarkMode] = useState(false);
    const themeStyles = darkMode ? styles.dark : styles.light;
    return (
        <View style={[styles.container, themeStyles]}>
         
            <View style={styles.headerContainer}>
                <Text style={[styles.header, darkMode && styles.headerDark]}>Welcome to Remcon</Text>

                <Text style={[styles.header, darkMode && styles.headerDark]}>Control your devices at fingertips</Text>
            </View>
            
            <View style={styles.summary}>



                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('DeviceControl')}
                >
                    <Text style={styles.addButtonText}> Control</Text>
                </TouchableOpacity>

               

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    light: {
        backgroundColor: '#f6f8fa',
    },
    dark: {
        backgroundColor: '#181a20',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 18,
        elevation: 2,
    },
    navBarDark: {
        backgroundColor: '#23262f',
    },
    appNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    appName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#007AFF',
        letterSpacing: 1,
        marginLeft: 6,
    },
    appNameDark: {
        color: '#fff',
    },
    navLinks: {
        flexDirection: 'row',
        gap: 18,
    },
    navLink: {
        fontSize: 17,
        color: '#444',
        fontWeight: '500',
        marginHorizontal: 8,
    },
    navLinkActive: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    navLinkDark: {
        color: '#fff',
    },
    header: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#222',
        letterSpacing: 1,
        textAlign: 'center',
    },
    headerDark: {
        color: '#fff',
    },
    summary: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        gap: 12,
    },
    summaryText: {
        fontSize: 18,
        color: '#444',
    },
    summaryTextDark: {
        color: '#ccc',
    },
    count: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#007AFF',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    headerContainer:{
        
        margin: 20,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    }
    // ...rest of your styles unchanged
});