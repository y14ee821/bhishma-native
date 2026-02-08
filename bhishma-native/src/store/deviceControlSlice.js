import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getIEInfo } from "../services/IE_Service";
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
        IE_Mapper: {},
        loadingIEInfo: false,
        errorIEInfo: null,
        publishingToggle: false,
        toggleError: null,
        allChannelOperationPerforming: false,
        allChannelOperationSuccess:false,
    },

    reducers: {
        checkBrokerConnection: (state, action) => {
            //console.log("Broker connection state:", action.payload)
            state.connectedToBroker = action.payload;
            if (action.payload) {
                // If connected, stop showing connecting state
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
            state.connectingToBroker = action.payload;
        },
        modifyIE_Machines: (state, action) => {
            //console.log("Updating IE_Info in store:", action.payload)
            state.IE_Info = action.payload;

        },
        updateIE_Mapper: (state, action) => {
            //console.log("Updating IE_Mapper in store:", action.payload)
            state.IE_Mapper = action.payload.data;

        },
        toggleChannel: (state, action) => {
            console.log("Updating IE_Info in store:", action.payload)
            const {ie_name,channelId,value} = action.payload;
            state.IE_Info[ie_name]["channels"][channelId]["currentState"] = value

        },    
        updateIEsState: (state,action) =>
        {
            const {ie_name,valueList} = action.payload;
            //console.log("from updateIEsState",ie_name,valueList);
            valueList.forEach((value,index) => 
            {
                state.IE_Info[ie_name]["channels"][index+1]["currentState"] = value
                state.IE_Info[ie_name]["channels"][index+1]["uiValue"] = value
            }
            
            )
            
        },
        updatedCurrentUIState: (state, action) => 
            {
                const {ie_name,index,newValue} = action.payload;
                //console.log("from updateIEsState",ie_name,valueList);
                //console.log("ie_name,channelId,value",ie_name,channelId,value,action.payload)
                state.IE_Info[ie_name]["channels"][index]["uiValue"] = newValue
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
            });
    },

})

export const { checkBrokerConnection, setConnectingToBroker, modifyIE_Machines, updateIE_Mapper, updateIEsState, updatedCurrentUIState, setAllChannelOperationPerforming, setAllChannelOperationSuccess } = deviceControlSlice.actions;
export const deviceControlReducer = deviceControlSlice.reducer;