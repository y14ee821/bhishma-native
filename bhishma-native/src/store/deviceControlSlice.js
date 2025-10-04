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

})

export const { checkBrokerConnection, modifyIE_Machines, updateIE_Mapper,updateIEsState,updatedCurrentUIState } = deviceControlSlice.actions;
export const deviceControlReducer = deviceControlSlice.reducer;