import {modifyIE_Machines} from "../store/deviceControlSlice"
import { MqttPub } from "./";

import { checkValue } from "../utils/Utilities";

export const MqttMessage = (client,IE_Info,dispatch) => {
  /*receives messages from the IE and do below things
  1. Modifies the current status of radio buttons as per the IE's channel.
  2. Shows the real time status of transactions between UI and IE
  3. Removes the class: 'ui' from radiobutton if both current output state and RadioButton state are same otherwise no change in button state will takes place.
  4. Whenever IE sends message then time will be updated in IE_Info context,
  5. Based on time 
  */
  //var IE_Info = {...IE_Info}
  const operationTimeout = 5000;
  //const { IE_Info } = useDeviceControlState();

  const radioOperation = (ChannelStatusSplit, topic) => {
    // if(IE_Info.length!=0)
    // {
    // console.log(topic.split("/")[0],IE_Info[topic.split("/")[0]]["lastUpdated"])
    // console.log("channel  updated time",IE_Info[topic.split("/")[0]]["channels"][ChannelStatusSplit[0][2]]["channelUpdatedTime"])
    // }
    //document.getElementById(`errorInControl`).innerText=""
    // This will call only when there is incoming message from the mqtt.
    //console.log("`${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-bc`",`${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-bc`)
    document
      .getElementById(`${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-bc`)
      .classList.remove(
        "bg-gradient-to-r",
        "from-green-400",
        "via-green-500",
        "to-green-600",
        "hover:bg-gradient-to-br",
        "focus:ring-4",
        "focus:outline-none",
        "focus:ring-green-300",
        "dark:focus:ring-green-800",
        "shadow-lg",
        "shadow-green-500/50",
        "dark:shadow-lg",
        "dark:shadow-green-800/80",
        "font-medium",
        "rounded-lg",
        "text-sm",
        "px-5",
        "py-2.5",
        "text-center",
        "me-2",
        "mb-2"
      ); //removes green background from the channel button.
    document
      .getElementById(`${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-bc`)
      .classList.remove(
        "text-white",
        "bg-gradient-to-r",
        "from-red-400",
        "via-red-500",
        "to-red-600",
        "hover:bg-gradient-to-br",
        "focus:ring-4",
        "focus:outline-none",
        "focus:ring-red-300",
        "dark:focus:ring-red-800",
        "shadow-lg",
        "shadow-red-500/50",
        "dark:shadow-lg",
        "dark:shadow-red-800/80",
        "font-medium",
        "rounded-lg",
        "text-sm",
        "px-5",
        "py-2.5",
        "text-center",
        "me-2",
        "mb-2"
      ); //removes red background from the channel button.
    if (
      !document
        .getElementById(`${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}`)
        .classList.contains("ui")
    ) {
      //if there is no change  from radio button UI
      ChannelStatusSplit[1] == 1
        ? 
          (document.querySelector(`input[aria-label="${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}"]`).checked = "1")
        : (document.querySelector(`input[aria-label="${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}"]`).checked = "")
      if (
        IE_Info.length != 0 &&
        IE_Info[topic.split("/")[0]]["channels"][ChannelStatusSplit[0][2]][
          "faulty"
        ] == true
      ) {
        console.log("error seen")
        // if due to some issue , device UI to control the IE then it will send the current status of all the UI buttons status to the IE, so that there will be change detected at IE side (UI control will have priority when compared to manual control)
        MqttPub(
          client,
          topic.split("/")[0],
          checkValue(
            topic.split("/")[0],
            Object.keys(IE_Info[topic.split("/")[0]]["channels"]).length
          )
        );
        IE_Info[topic.split("/")[0]]["channels"][ChannelStatusSplit[0][2]][
          "faulty"
        ] = false;
        // notify(
        //   `unable to control the channel:${ChannelStatusSplit[0][2]}, try again`
        // );
        alert(`unable to control the channel:${ChannelStatusSplit[0][2]}, try again`)
        window.location.reload()
        dispatch(modifyIE_Machines(IE_Info));
        

      }
      document.getElementById(
        `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-current`
      ).innerText = `Current State: ${
        ChannelStatusSplit[1] == 1 ? "ON" : "OFF"
      }`;
      document
        .getElementById(`${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}`)
        .removeAttribute("disabled", false);
      document
        .getElementById(
          `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-cursor`
        )
        .classList.remove("cursor-disable"); //modifies cursor state to 'normal'
      {
        ChannelStatusSplit[1] == 1
          ? document
              .getElementById(
                `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-bc`
              )
              .classList.add(
                "bg-gradient-to-r",
                "from-green-400",
                "via-green-500",
                "to-green-600",
                "hover:bg-gradient-to-br",
                "focus:ring-4",
                "focus:outline-none",
                "focus:ring-green-300",
                "dark:focus:ring-green-800",
                "shadow-lg",
                "shadow-green-500/50",
                "dark:shadow-lg",
                "dark:shadow-green-800/80",
                "font-medium",
                "rounded-lg",
                "text-sm",
                "px-5",
                "py-2.5",
                "text-center",
                "me-2",
                "mb-2"
              )
          : document
              .getElementById(
                `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-bc`
              )
              .classList.add(
                "text-white",
                "bg-gradient-to-r",
                "from-red-400",
                "via-red-500",
                "to-red-600",
                "hover:bg-gradient-to-br",
                "focus:ring-4",
                "focus:outline-none",
                "focus:ring-red-300",
                "dark:focus:ring-red-800",
                "shadow-lg",
                "shadow-red-500/50",
                "dark:shadow-lg",
                "dark:shadow-red-800/80",
                "font-medium",
                "rounded-lg",
                "text-sm",
                "px-5",
                "py-2.5",
                "text-center",
                "me-2",
                "mb-2"
              );
        //console.log(startTime,changeTime)
      }
    } //if there is change  from radio button UI
    else {
      if (IE_Info.length != 0)
        if (
          ChannelStatusSplit[1] ==
          IE_Info[topic.split("/")[0]]["channels"][ChannelStatusSplit[0][2]][
            "radioValue"
          ]
        ) {
          //if desired state == current state, then removes the "ui" from class list, so that radio buttons will be changed as per the output state.
          document
            .getElementById(
              `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}`
            )
            .classList.remove("ui");
        } else {
          if (
            new Date() -
              IE_Info[topic.split("/")[0]]["channels"][
                ChannelStatusSplit[0][2]
              ]["channelUpdatedTime"] >=
            operationTimeout
          ) {
            //if UI failed to control the channel within duration then cursor-disable state will be removed and radio button will be updated as per the channel state.
            document
              .getElementById(
                `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-cursor`
              )
              .classList.remove("cursor-disable"); //modifies cursor state to 'allowed'
            document
              .getElementById(
                `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}`
              )
              .classList.remove("ui");
            alert(
              `unable to control the channel:${ChannelStatusSplit[0][2]}, try again`
            );
            IE_Info[topic.split("/")[0]]["channels"][ChannelStatusSplit[0][2]][
              "faulty"
            ] = true; // changes "faulty" field to true so that all radio button state will be captured and sent to IE
          }
          document.getElementById(
            `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-current`
          ).innerText = "working";
          document
            .getElementById(
              `${topic.split("/")[0]}-${ChannelStatusSplit[0][2]}-cursor`
            )
            .classList.add("cursor-disable"); //modifies cursor state to 'not-allowed'

          //}
        }
    }
  };


  client.on("message", function (topic, message) {
  const groupKey = topic.split("/")[0];

  // Clone the group object
  const updatedGroup = {
    ...IE_Info[groupKey],
    lastUpdated: new Date(),
    running: true,
  };

  // Clone the full IE_Info object
  const updatedIE_Info = {
    ...IE_Info,
    [groupKey]: updatedGroup,
  };
  
  dispatch(modifyIE_Machines(updatedIE_Info));

  try {
    message
      .toString()
      .split("-")
      .map((i) => i.split(":"))
      .map((ChannelStatusSplit) => {
        if (ChannelStatusSplit != undefined) {
          return radioOperation(ChannelStatusSplit, topic);
        }
      });
  } catch (error) {
    console.log(error);
  }
});
}; 