import { createSlice } from "@reduxjs/toolkit";
const deviceSlice = createSlice({
    name: 'device',
    initialState: {
        channels: [0, 0, 0, 0],
        online: false,

        
    },
    reducers: {
        updateDeviceState: (state, action) => {
            state.channels = action.payload.channels;
            state.online = true;
        },
        toggleChannel: (state, action) => {
            const { index, value } = action.payload;
            state.channels[index] = value;
        },
    },
});

export const { updateDeviceState, toggleChannel } = deviceSlice.actions;
export const deviceReducer =  deviceSlice.reducer;
