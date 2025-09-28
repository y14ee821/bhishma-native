import { createSlice } from "@reduxjs/toolkit";

const deviceControlSlice = createSlice({

    name: 'deviceControl',
    initialState: {
        connectedToBroker: false,
        channelStates: {},
        IE_Info: [],
        IE_Mapper: {}
    },

    reducers: {
        checkBrokerConnection: (state, action) => {
            //console.log("Broker connection state:", action.payload)
            state.connectedToBroker = action.payload;
            //state.online = true;
        },
        modifyIE_Machines: (state, action) => {
            //console.log("Updating IE_Info in store:", action.payload)
            state.IE_Info = action.payload;

        },
        updateIE_Mapper: (state, action) => {
            //console.log("Updating IE_Mapper in store:", action.payload)
            state.IE_Mapper = action.payload.data;

        },
    },

})

export const { checkBrokerConnection, modifyIE_Machines, updateIE_Mapper } = deviceControlSlice.actions;
export const deviceControlReducer = deviceControlSlice.reducer;