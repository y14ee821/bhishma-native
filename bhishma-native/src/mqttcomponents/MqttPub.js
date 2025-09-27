export const MqttPub = (client,topic,message) => {
  let i = 0
  // while(i<10)
  //   {
      client.publish(topic, message,(error)=>{
        if(error)
        {
          console.log("error in publish: ",error)
        }
        else
        {
          console.log(`Published Message: '${message}' Published on Topic: ${topic}`)
        }
      })
    //   i = i+1
    // }

 


  return (
    <div>
      
    </div>
  )
}
