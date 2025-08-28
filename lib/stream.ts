import { StreamChat } from 'stream-chat';

const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;
const apiSecret = process.env.STREAM_SECRET!;

export const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export async function createStreamUser(userId: string, name: string, email: string) {
  try {
    const user = await serverClient.upsertUser({
      id: userId,
      name,
      email,
      image: `https://getstream.io/random_png/?name=${name}`,
    });
    return user;
  } catch (error) {
    console.error('Error creating Stream user:', error);
    throw error;
  }
}

export function generateStreamToken(userId: string): string {
  return serverClient.createToken(userId);
}

export async function createChannel(channelType: 'messaging' | 'team', channelId: string, members: string[], createdBy: string) {
  try {
    const channel = serverClient.channel(channelType, channelId, {
      members,
      created_by_id: createdBy,
    });
    
    await channel.create();
    return channel;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
}

/**
 * Create a deterministic direct (1-1) channel for two users.
 * The channel ID is stable (sorted member ids joined) so repeated creates return the same channel.
 */
export async function createDirectChannel(members: string[], createdBy: string) {
  if (!Array.isArray(members) || members.length < 2) {
    throw new Error('createDirectChannel requires at least 2 member ids');
  }

  // Use a stable id so we don't create duplicate DM channels between the same two users
  const sorted = [...members].sort();
  const channelId = `dm-${sorted.join('-')}`;

  return createChannel('messaging', channelId, sorted, createdBy);
}
