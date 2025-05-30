import kafkaClient from 'kafka-node';
import dotenv from 'dotenv';

dotenv.config();

export const primaryWriteStreamAdapter = {
    client: null as any,
    
    async connect () {
        try {
            this.client = new kafkaClient.KafkaClient({
                kafkaHost: process.env.KAFKA_HOST,
                connectTimeout: 10000, // 10 seconds
                requestTimeout: 30000, // 30 seconds
                autoConnect: true,
                retryOptions: {
                    retries: 5,
                    factor: 2, // Exponential backoff
                    minTimeout: 1000, // 1 second
                    maxTimeout: 3000 // 3 seconds
                }
            });

            this.client.on('ready', () => {
                console.log("Successfully connected to WriteStream service!");
            });

            this.client.on('error', (err: any) => {
                console.error("Error connecting to WriteStream service", err);
            });
        } catch (error) {
            console.error("Error connecting to WriteStream service", error)
        }
    },

    async isServiceUp () {
        try {
            if (this.client) {
                // Check if the client is connected
                return this.client.ready;
            }
            return false;
        } catch (err) {
            console.error("Error checking WriteStream service status", err);
            return false;
        }
    },

    async publish (topic: string, data: any) {

        if (!this.client) {
            throw new Error("WriteStream client is not initialized");
        }

        return new Promise((resolve, reject) => {
            const producer = new kafkaClient.Producer(this.client);

            producer.on('ready', () => {
                const payloads = { topic: topic, messages: JSON.stringify(data) }
                producer.send(payloads, (err: Error, data: any) => {
                    if (err) {
                        console.error("Could not stream the topic")
                        reject(err)
                    } else {
                        resolve("Message stream is completed")
                        console.info("Message stream is completed")
                    }
                })
            })

            producer.on('error', (err: Error) => {
                console.error("Error in WriteStream producer", err);
                reject(err);
            });
        })
        
    },

    async subscribe (topic: string, callback: (message: any) => void) { 
        
        if (!this.client) {
            throw new Error("WriteStream client is not initialized");
        }

        const consumer = new kafkaClient.Consumer(
            this.client,
            [{ topic: topic, partition: 0 }],
            { autoCommit: true }
        );

        consumer.on('message', (message: any) => {
            try {
                const parsedMessage = JSON.parse(message.value);
                callback(parsedMessage);
            } catch (err) {
                console.error("Error parsing message", err);
            }
        });

        consumer.on('error', (err: any) => {
            console.error("Error in WriteStream consumer", err);
        });
    }

}