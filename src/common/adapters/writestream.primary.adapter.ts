import kafkaClient from 'kafka-node';
import dotenv from 'dotenv';

dotenv.config();

class PrimaryWriteStreamAdapter {
    /**
     * Primary WriteStream adapter: Kafka based
     */
    private client: any = null

    /**
     * Kafka producer instance
     */
    private producer: kafkaClient.Producer | null = null;

    async connect() {
        try {
            this.client = new kafkaClient.KafkaClient({
                kafkaHost: process.env.KAFKA_HOST,
                connectTimeout: 10000, // 10 seconds
                requestTimeout: 30000, // 30 seconds
                autoConnect: true
            });

            this.producer = new kafkaClient.Producer(this.client, {
                requireAcks: 1,
                partitionerType: 2
            });

            this.producer.on('ready', () => {
                console.info("WriteStream producer is ready");
            })

            this.producer.on('error', (err: Error) => {
                console.error("Error in WriteStream producer", err);
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
    }

    async isConnected() {
        try {
            if (this.client) {
                // Check if the client is connected
                return this.client.ready;
            }
            return false;
        } catch (err) {
            console.error("Error checking WriteStream connection", err);
            return false;
        }
    }

    async isServiceUp() {
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
    }

    async publish(topic: string, data: any) {

        if (!topic || !data) {
            throw new Error("Topic and data must be provided");
        }

        if (!this.client) {
            throw new Error("WriteStream client is not initialized");
        }

        if (!this.producer) {
            throw new Error("WriteStream producer is not initialized");
        }

        const payloads = [{ topic: topic, messages: JSON.stringify(data) }]

        return new Promise((resolve, reject) => {
            this.producer?.send(payloads, (err: Error, data: any) => {
                if (err) {
                    console.error("Could not stream the topic")
                    reject(err)
                } else {
                    resolve("Message stream is completed")
                    console.info("Message stream is completed")
                }
            })
        })
    }

    async subscribe(topic: string, callback: (message: any) => void) {
        if (!this.client) {
            throw new Error("WriteStream client is not initialized");
        }

        try {
            // 🔍 Check topic metadata before consuming
            await new Promise<void>((resolve, reject) => {
                this.client!.loadMetadataForTopics([topic], (error: any, results: any) => {
                    if (error) {
                        reject(new Error(`Topic "${topic}" does not exist or metadata load failed: ${error.message}`));
                    } else {
                        resolve();
                    }
                });
            });

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
                    console.error("Error parsing message:", err);
                }
            });

            consumer.on('error', (err: any) => {
                console.error("Error in WriteStream consumer:", err);
            });

        } catch (err) {
            console.error(`Failed to subscribe to topic "${topic}":`, err);
        }
    }

}

export const primaryWriteStreamAdapter = new PrimaryWriteStreamAdapter();
