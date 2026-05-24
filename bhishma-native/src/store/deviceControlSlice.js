import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getIEInfo, changeChannelName } from "../services/IE_Service";
import { publishToggle } from "../services/mqttService";

// Async thunk for fetching IE info
export const fetchIEInfo = createAsyncThunk(
    'deviceControl/fetchIEInfo',
    async (_, { rejectWithValue }) => {
        try {
            const result = await getIEInfo();
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error || 'Failed to fetch IE info');
            }
        } catch (error) {
            return rejectWithValue(error.message || 'An error occurred while fetching IE info');
        }
    }
);

// Async thunk for renaming a channel. Pulls device_id / channel_id / ie_name /
// new_name from `updateChannelDetails`, calls the backend, then patches both
// IE_Info and currentIEInfo so the UI updates without a refetch.
export const renameChannel = createAsyncThunk(
    'deviceControl/renameChannel',
    async (_, { getState, dispatch, rejectWithValue }) => {
        const { device_id, channel_id, new_name, ie_name } =
            getState().deviceControl.updateChannelDetails;

        if (!device_id || channel_id == null || !ie_name) {
            return rejectWithValue('Missing channel context');
        }

        const trimmed = (new_name ?? '').trim();
        if (!trimmed) {
            return rejectWithValue('Channel name cannot be empty');
        }

        const result = await changeChannelName(device_id, channel_id, trimmed);
        if (!result.success) {
            return rejectWithValue(result.error || 'Failed to rename channel');
        }

        dispatch(applyChannelNameUpdate({ ie_name, channel_id, new_name: trimmed }));
        dispatch(resetUpdateChannelConfig());
        return result.data;
    }
);

// Async thunk for publishing MQTT toggle command
export const publishToggleCommand = createAsyncThunk(
    'deviceControl/publishToggle',
    async ({ channel, state, ie_name, client }, { rejectWithValue, dispatch, getState }) => {
        try {
            // Publish the toggle command
            publishToggle(channel, state, ie_name, client);
            
            // Optimistically update UI state using the action type directly
            // We'll dispatch the action after the slice is created
            dispatch({ 
                type: 'deviceControl/updatedCurrentUIState', 
                payload: { ie_name, index: channel, newValue: state } 
            });
            
            return { channel, state, ie_name, success: true };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to publish toggle command');
        }
    }
);

const deviceControlSlice = createSlice({

    name: 'deviceControl',
    initialState: {
        connectedToBroker: false,
        connectingToBroker: false,
        channelStates: {},
        IE_Info: {},
        currentIEInfo: {},
        IE_Mapper: {},
        loadingIEInfo: false,
        errorIEInfo: null,
        publishingToggle: false,
        toggleError: null,
        allChannelOperationPerforming: false,
        allChannelOperationSuccess:false,
        updateChannelDetails: {
            openModal: false,
            new_name: '',
            device_id: null,
            channel_id: null,
            ie_name: null,
            saving: false,
            error: null,
        }
    },

    reducers: {
        // Partial setter for any field on `updateChannelDetails`. Only updates
        // keys that are explicitly present in the payload.
        updateChannelConfig: (state, action) => {
            const allowed = [
                'openModal',
                'new_name',
                'device_id',
                'channel_id',
                'ie_name',
                'saving',
                'error',
            ];
            allowed.forEach((key) => {
                if (key in action.payload) {
                    state.updateChannelDetails[key] = action.payload[key];
                }
            });
        },
        // Reset modal back to closed/empty defaults (used on Cancel + after Save).
        resetUpdateChannelConfig: (state) => {
            state.updateChannelDetails = {
                openModal: false,
                new_name: '',
                device_id: null,
                channel_id: null,
                ie_name: null,
                saving: false,
                error: null,
            };
        },
        // After a successful rename, patch the channel name locally in both
        // IE_Info (source) and currentIEInfo (rendered slice) so toggles stay
        // mounted and the new label appears immediately.
        applyChannelNameUpdate: (state, action) => {
            const { ie_name, channel_id, new_name } = action.payload;
            if (state.IE_Info?.[ie_name]?.channels?.[channel_id]) {
                state.IE_Info[ie_name].channels[channel_id].name = new_name;
            }
            if (state.currentIEInfo?.[ie_name]?.channels?.[channel_id]) {
                state.currentIEInfo[ie_name].channels[channel_id].name = new_name;
            }
        },
        checkBrokerConnection: (state, action) => {
            const connected = Boolean(action.payload);
            state.connectedToBroker = connected;
            if (connected) {
                state.connectingToBroker = false;
            }
        },
        setAllChannelOperationPerforming: (state, action) =>
        {
            state.allChannelOperationPerforming = action.payload;
        },
        setAllChannelOperationSuccess: (state, action) =>
        {
            state.allChannelOperationSuccess = action.payload;
        },
        setConnectingToBroker: (state, action) => {
            state.connectingToBroker = Boolean(action.payload);
        },
        modifyIE_Machines: (state, action) => {
            //console.log("Updating IE_Info in store:", action.payload)
            state.IE_Info = action.payload;

        },
        updateIE_Mapper: (state, action) => {
            //console.log("Updating IE_Mapper in store:", action.payload)
            state.IE_Mapper = action.payload.data;

        },
        updateCurrentIEInfo: (state, action) =>
        {
            state.currentIEInfo = action.payload?.data;
        },
        toggleChannel: (state, action) => {
            console.log("Updating IE_Info in store:", action.payload)
            const {ie_name,channelId,value} = action.payload;
            state.currentIEInfo[ie_name]["channels"][channelId]["currentState"] = value

        },    
        updateIEsState: (state,action) =>
        {
            const {ie_name,valueList} = action.payload;
            //console.log("from updateIEsState",ie_name,valueList);
            if(state.currentIEInfo && state.currentIEInfo[ie_name])
            {   
            valueList.forEach((value,index) => 
            {   
                state.currentIEInfo[ie_name]["channels"][index+1]["currentState"] = value
                state.currentIEInfo[ie_name]["channels"][index+1]["uiValue"] = value
                state.IE_Info[ie_name]["channels"][index+1]["currentState"] = value
                state.IE_Info[ie_name]["channels"][index+1]["uiValue"] = value                
            }

            
            )
        }
            
        },
        updatedCurrentUIState: (state, action) => 
            {
                const {ie_name,index,newValue} = action.payload;
                //console.log("from updateIEsState",ie_name,valueList);
                console.log("ie_name,index,newValue", ie_name,index,newValue)

                state.currentIEInfo[ie_name]["channels"][index]["uiValue"] = newValue
            }
    },
    extraReducers: (builder) => {
        builder
            // Fetch IE Info
            .addCase(fetchIEInfo.pending, (state) => {
                state.loadingIEInfo = true;
                state.errorIEInfo = null;
            })
            .addCase(fetchIEInfo.fulfilled, (state, action) => {
                state.loadingIEInfo = false;
                state.errorIEInfo = null;
                state.IE_Info = action.payload;
            })
            .addCase(fetchIEInfo.rejected, (state, action) => {
                state.loadingIEInfo = false;
                state.errorIEInfo = action.payload || 'Failed to fetch IE info';
            })
            // Publish Toggle Command
            .addCase(publishToggleCommand.pending, (state) => {
                state.publishingToggle = true;
                state.toggleError = null;
            })
            .addCase(publishToggleCommand.fulfilled, (state, action) => {
                state.publishingToggle = false;
                state.toggleError = null;
                // UI state is already updated optimistically in the thunk
            })
            .addCase(publishToggleCommand.rejected, (state, action) => {
                state.publishingToggle = false;
                state.toggleError = action.payload || 'Failed to publish toggle command';
            })
            // Rename Channel
            .addCase(renameChannel.pending, (state) => {
                state.updateChannelDetails.saving = true;
                state.updateChannelDetails.error = null;
            })
            .addCase(renameChannel.fulfilled, (state) => {
                state.updateChannelDetails.saving = false;
                state.updateChannelDetails.error = null;
            })
            .addCase(renameChannel.rejected, (state, action) => {
                state.updateChannelDetails.saving = false;
                state.updateChannelDetails.error =
                    action.payload || 'Failed to rename channel';
            });
    },

})

export const {
    checkBrokerConnection,
    setConnectingToBroker,
    modifyIE_Machines,
    updateIE_Mapper,
    updateIEsState,
    updatedCurrentUIState,
    setAllChannelOperationPerforming,
    setAllChannelOperationSuccess,
    updateCurrentIEInfo,
    updateChannelConfig,
    resetUpdateChannelConfig,
    applyChannelNameUpdate,
} = deviceControlSlice.actions;
export const deviceControlReducer = deviceControlSlice.reducer;
