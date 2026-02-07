/**
 * MqttSub - Utility function to subscribe to an MQTT topic
 * 
 * @param {Object} client - MQTT client instance
 * @param {string} topic - Topic to subscribe to
 * @param {Object} options - Subscription options (optional)
 * @returns {Promise} - Resolves when subscribed, rejects on error
 */
export const MqttSub = (client, topic, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!client) {
      console.error('❌ MQTT client is not initialized');
      reject(new Error('MQTT client is not initialized'));
      return;
    }

    client.subscribe(topic, options, (err, granted) => {
      if (err) {
        console.error(`❌ Failed to subscribe to ${topic}:`, err);
        reject(err);
      } else {
        console.log(`✅ Subscribed to ${topic}`, granted);
        resolve(granted);
      }
    });
  });
};
