import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';

/**
 * ส่งข้อความผ่าน LINE Messaging API
 * @param {string} userId - LINE User ID ของผู้รับข้อความ
 * @param {Array} messages - ข้อความที่ต้องการส่ง (รูปแบบ LINE Message Objects)
 * @returns {Promise<Object>} - ผลลัพธ์การส่งข้อความ
 */
export const sendLineMessage = async (userId, messages) => {
    try {
        if (!LINE_CHANNEL_ACCESS_TOKEN) {
            console.warn('LINE_CHANNEL_ACCESS_TOKEN is not set in environment variables');
            return { success: false, error: 'LINE_CHANNEL_ACCESS_TOKEN is not set' };
        }

        const response = await axios.post(
            LINE_MESSAGING_API,
            {
                to: userId,
                messages: messages
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
                }
            }
        );

        return { success: true, data: response.data };
    } catch (error) {
        console.error('LINE Messaging API Error:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};

/**
 * ส่งข้อความแจ้งเตือนไปยังกลุ่ม LINE
 * @param {string} groupId - LINE Group ID
 * @param {string} message - ข้อความที่ต้องการส่ง
 * @returns {Promise<Object>} - ผลลัพธ์การส่งข้อความ
 */
export const sendLineGroupMessage = async (groupId, message) => {
    const messages = [
        {
            type: 'text',
            text: message
        }
    ];

    return await sendLineMessage(groupId, messages);
};

/**
 * ข้อความแจ้งเตือนการเช็คของออก
 * @param {Object} checkout - ข้อมูลการเช็คของออก
 * @param {Object} job - ข้อมูลงาน
 * @param {Object} user - ข้อมูลผู้ใช้
 * @param {Array} items - รายการสิ่งของ
 * @returns {string} - ข้อความแจ้งเตือน
 */
export const createCheckoutNotificationMessage = (checkout, job, user, items) => {
    // สร้างส่วนหัวของข้อความ
    let message = `\n🔔 สรุปการเช็คของออก\n\n`;
    message += `📋 งาน: ${job.title}\n`;
    message += `👤 โดย: ${user.name}\n`;
    message += `⏰ เวลา: ${formatDateTime(checkout.createdAt)}\n\n`;

    // สร้างรายการสิ่งของ
    message += `📦 รายการสิ่งของ:\n`;

    items.forEach((item, index) => {
        const plannedQty = item.quantity;
        const actualQty = item.actualQuantity;
        const isComplete = plannedQty === actualQty;
        const statusSymbol = isComplete ? '✅' : '❌';

        message += `${index + 1}. ${item.item.name} ${plannedQty}/${actualQty} ${statusSymbol}\n`;
    });

    return message;
};

/**
 * ฟอร์แมตวันที่และเวลา
 * @param {string|Date} dateTime - วันที่และเวลา
 * @returns {string} - วันที่และเวลาที่ฟอร์แมตแล้ว
 */
const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 *  Flex Message สำหรับการเช็คของออก
 * @param {Object} checkout - ข้อมูลการเช็คของออก
 * @param {Object} job - ข้อมูลงาน
 * @param {Object} user - ข้อมูลผู้ใช้
 * @param {Array} items - รายการสิ่งของ
 * @returns {Object} - Flex Message Object
 */
export const createCheckoutFlexMessage = (checkout, job, user, items) => {
    const itemContents = items.map((item, index) => {
        const plannedQty = item.quantity;
        const actualQty = item.actualQuantity;
        const isComplete = plannedQty === actualQty;
        const statusEmoji = isComplete ? '✅' : '❌';

        return {
            type: 'box',
            layout: 'horizontal',
            contents: [
                {
                    type: 'text',
                    text: `${index + 1}. ${item.item.name}`,
                    size: 'sm',
                    color: '#555555',
                    flex: 5
                },
                {
                    type: 'text',
                    text: `${plannedQty}/${actualQty}`,
                    size: 'sm',
                    color: '#111111',
                    align: 'end',
                    flex: 2
                },
                {
                    type: 'text',
                    text: statusEmoji,
                    size: 'sm',
                    align: 'end',
                    flex: 1
                }
            ]
        };
    });

    //  Flex Message
    return {
        type: 'flex',
        altText: `สรุปการเช็คของออก: ${job.title}`,
        contents: {
            type: 'bubble',
            header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: '🔔 สรุปการเช็คของออก',
                        weight: 'bold',
                        size: 'lg',
                        color: '#ffffff'
                    }
                ],
                backgroundColor: '#0367D3'
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    {
                                        type: 'text',
                                        text: '📋 งาน:',
                                        size: 'sm',
                                        color: '#555555',
                                        flex: 1
                                    },
                                    {
                                        type: 'text',
                                        text: job.title,
                                        size: 'sm',
                                        color: '#111111',
                                        flex: 4
                                    }
                                ]
                            },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    {
                                        type: 'text',
                                        text: '👤 โดย:',
                                        size: 'sm',
                                        color: '#555555',
                                        flex: 1
                                    },
                                    {
                                        type: 'text',
                                        text: user.name,
                                        size: 'sm',
                                        color: '#111111',
                                        flex: 4
                                    }
                                ]
                            },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    {
                                        type: 'text',
                                        text: '⏰ เวลา:',
                                        size: 'sm',
                                        color: '#555555',
                                        flex: 1
                                    },
                                    {
                                        type: 'text',
                                        text: formatDateTime(checkout.createdAt),
                                        size: 'sm',
                                        color: '#111111',
                                        flex: 4
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: 'separator',
                        margin: 'lg'
                    },
                    {
                        type: 'text',
                        text: '📦 รายการสิ่งของ:',
                        weight: 'bold',
                        size: 'md',
                        margin: 'lg'
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        spacing: 'sm',
                        contents: itemContents
                    }
                ]
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        action: {
                            type: 'uri',
                            label: 'ดูรายละเอียดเพิ่มเติม',
                            uri: `${process.env.FRONTEND_URL}/jobs/${job.id}`
                        }
                    }
                ]
            }
        }
    };
}; 