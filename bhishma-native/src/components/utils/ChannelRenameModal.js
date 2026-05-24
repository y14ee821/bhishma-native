import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useUpdateChannelDetails } from '../../reduxStates';
import {
    updateChannelConfig,
    resetUpdateChannelConfig,
    renameChannel,
} from '../../store/deviceControlSlice';
import { useSnackbar } from '../../utils/common';

/**
 * Singleton "rename channel" modal driven by Redux state
 * (`deviceControl.updateChannelDetails`). Mount once near the root of any
 * screen that contains channel controls; any ToggleSwitch's Edit button opens
 * it by dispatching `updateChannelConfig({ openModal: true, ... })`.
 */
export const ChannelRenameModal = () => {
    const dispatch = useDispatch();
    const { showSuccess, showError } = useSnackbar();
    const { openModal, new_name, saving, error } = useUpdateChannelDetails();

    const handleCancel = () => {
        if (saving) return;
        dispatch(resetUpdateChannelConfig());
    };

    // Success path closes the modal (handled by the thunk) and surfaces a
    // snackbar so the user sees confirmation. Errors stay inline in the modal
    // AND fire an error snackbar so they're visible even if the user has
    // scrolled / the modal is partially obscured.
    const handleSave = async () => {
        if (saving) return;
        try {
            await dispatch(renameChannel()).unwrap();
            showSuccess('Channel name updated');
        } catch (err) {
            const message =
                typeof err === 'string'
                    ? err
                    : err?.message || 'Failed to rename channel';
            showError(message);
        }
    };

    return (
        <Modal
            visible={!!openModal}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Rename channel</Text>

                    <TextInput
                        placeholder="Enter new channel name"
                        placeholderTextColor="#94a3b8"
                        value={new_name ?? ''}
                        onChangeText={(text) =>
                            dispatch(updateChannelConfig({ new_name: text }))
                        }
                        style={styles.input}
                        autoFocus
                        maxLength={50}
                        editable={!saving}
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={handleCancel}
                            disabled={saving}
                            style={[styles.button, styles.buttonGhost]}
                        >
                            <Text style={styles.buttonGhostText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving || !(new_name ?? '').trim()}
                            style={[
                                styles.button,
                                styles.buttonPrimary,
                                (saving || !(new_name ?? '').trim()) && styles.buttonDisabled,
                            ]}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.buttonPrimaryText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 20,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#0f172a',
        backgroundColor: '#f8fafc',
    },
    error: {
        marginTop: 8,
        fontSize: 13,
        color: '#dc2626',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 18,
        gap: 8,
    },
    button: {
        minWidth: 88,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonGhost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    buttonGhostText: {
        color: '#334155',
        fontWeight: '600',
    },
    buttonPrimary: {
        backgroundColor: '#2563eb',
    },
    buttonPrimaryText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.55,
    },
});
