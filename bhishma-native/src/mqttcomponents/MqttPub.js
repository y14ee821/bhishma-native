/**
 * MqttPub - Utility function to publish a message to an MQTT topic
 * 
 * @param {Object} client - MQTT client instance
 * @param {string} topic - Topic to publish to
 * @param {string} message - Message to publish
 * @returns {Promise} - Resolves when published, rejects on error
 */
export const MqttPub = (client, topic, message) => {
  return new Promise((resolve, reject) => {
    if (!client) {
      console.error('❌ MQTT client is not initialized');
      reject(new Error('MQTT client is not initialized'));
      return;
    }

    client.publish(topic, message, (error) => {
      if (error) {
        console.error(`❌ Error publishing to ${topic}:`, error);
        reject(error);
      } else {
        console.log(`✅ Published to ${topic}: ${message}`);
        resolve();
      }
    });
  });
};
