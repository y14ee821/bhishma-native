import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const devices = [
    {
        id: '1',
        name: 'Living Room Light',
        currentState: 'ON',
        IE_Name: 'Living Room',
        radioValue: '2.4GHz',
        channelUpdatedTime: '2024-06-10 14:22',
    },
    {
        id: '2',
        name: 'Garage Door',
        currentState: 'OFF',
        IE_Name: 'Garage',
        radioValue: '5GHz',
        channelUpdatedTime: '2024-06-10 13:55',
    },
    {
        id: '3',
        name: 'Thermostat',
        currentState: '22°C',
        IE_Name: 'Hall',
        radioValue: '',
        channelUpdatedTime: '2024-06-10 12:30',
    },
];

export const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>My IoT Devices</Text>
            <View style={styles.summary}>
                <Text style={styles.summaryText}>
                    Devices Connected: <Text style={styles.count}>{devices.length}</Text>
                </Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddDevice')}
                >
                    <Text style={styles.addButtonText}>+ Add Device</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={devices}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.deviceCard}
                        onPress={() => navigation.navigate('DeviceDetail', { deviceId: item.id })}
                    >
                        <View style={styles.deviceInfo}>
                            <Text style={styles.deviceName}>{item.name}</Text>
                            <Text style={styles.deviceState}>
                                State: <Text style={{color: item.currentState === 'ON' ? '#34C759' : '#FF3B30'}}>{item.currentState}</Text>
                            </Text>
                            <Text style={styles.deviceDetail}>IE Name: <Text style={styles.deviceDetailValue}>{item.IE_Name}</Text></Text>
                            {item.radioValue ? (
                                <Text style={styles.deviceDetail}>Radio: <Text style={styles.deviceDetailValue}>{item.radioValue}</Text></Text>
                            ) : null}
                            <Text style={styles.deviceDetail}>Updated: <Text style={styles.deviceDetailValue}>{item.channelUpdatedTime}</Text></Text>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.deviceList}
            />
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
            >
                <Text style={styles.settingsText}>Settings</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f8fa',
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#222',
        letterSpacing: 1,
    },
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    summaryText: {
        fontSize: 18,
        color: '#444',
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
    deviceList: {
        paddingBottom: 20,
    },
    deviceCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#007AFF',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        borderLeftWidth: 5,
        borderLeftColor: '#007AFF',
    },
    deviceInfo: {
        flexDirection: 'column',
    },
    deviceName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    deviceState: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    deviceDetail: {
        fontSize: 15,
        color: '#555',
        marginBottom: 2,
    },
    deviceDetailValue: {
        color: '#007AFF',
        fontWeight: '500',
    },
    settingsButton: {
        marginTop: 'auto',
        alignSelf: 'center',
        padding: 12,
    },
    settingsText: {
        color: '#007AFF',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});