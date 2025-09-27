import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';

// Example channels
const CHANNELS = [
    { id: 1, name: 'Light' },
    { id: 2, name: 'Fan' },
    { id: 3, name: 'Heater' },
    { id: 4, name: 'AC' },
];

export const DeviceControl = () => {
    const [channelStates, setChannelStates] = useState(
        CHANNELS.reduce((acc, channel) => {
            acc[channel.id] = false;
            return acc;
        }, {})
    );

    const toggleChannel = (id) => {
        setChannelStates((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
        // TODO: Send command to IoT device here
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Device Control</Text>
            {CHANNELS.map((channel) => (
                <View key={channel.id} style={styles.channelRow}>
                    <Text style={styles.channelName}>{channel.name}</Text>
                    <Switch
                        value={channelStates[channel.id]}
                        onValueChange={() => toggleChannel(channel.id)}
                    />
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#f5f5f5',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    channelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
    },
    channelName: {
        fontSize: 18,
    },
});

