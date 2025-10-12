
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const HomeScreen = ({ navigation, darkMode, setDarkMode}) => {
    //const [darkMode, setDarkMode] = useState(false);
    console.log(darkMode,setDarkMode)
    const theme = darkMode ? darkTheme : lightTheme;
    return (
        <LinearGradient
            colors={theme.gradient}
            style={styles.gradient}
        >
            <View style={[styles.container, { backgroundColor: 'transparent' }]}> 
                <View style={[styles.headerContainer, theme.card]}> 
                    <Text style={[styles.header, theme.header]}>Welcome to Remcon</Text>
                    <Text style={[styles.header, theme.header]}>Control your devices at fingertips</Text>
                </View>
                <View style={styles.summary}>
                    <TouchableOpacity
                        style={[styles.addButton, theme.button]}
                        onPress={() => navigation.navigate('DeviceControl')}
                    >
                        <Text style={[styles.addButtonText, theme.buttonText]}>Control</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    headerContainer: {
        margin: 20,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        letterSpacing: 1.2,
        textAlign: 'center',
    },
    summary: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 18,
        marginTop: 30,
    },
    addButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: '#007AFF',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        marginTop: 10,
        marginBottom: 10,
        elevation: 4,
    },
    addButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    themeSwitchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    themeSwitchText: {
        fontSize: 16,
        fontWeight: '500',
        marginRight: 10,
    },
});

const lightTheme = {
    gradient: ['#f6f8fa', '#e3eafc', '#f6f8fa'],
    card: {
        backgroundColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        shadowColor: '#007AFF',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        color: '#007AFF',
        textShadowColor: '#e3eafc',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    button: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: '#fff',
    },
};

const darkTheme = {
    gradient: ['#181a20', '#23262f', '#181a20'],
    card: {
        backgroundColor: '#23262f',
        borderColor: '#333',
        borderWidth: 1,
        shadowColor: '#fff',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        color: '#fff',
        textShadowColor: '#23262f',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    button: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: '#fff',
    },
};