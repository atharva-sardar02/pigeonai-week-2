import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';

/**
 * Group Model
 * 
 * Represents a group chat with multiple members and admins.
 * Groups are referenced by conversations but stored separately for easier management.
 */

export interface Group {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  adminIds: string[]; // User IDs of admins (can manage group)
  memberIds: string[]; // User IDs of all members (includes admins)
  createdAt: Date;
  createdBy: string; // User ID of creator
  updatedAt: Date;
}

/**
 * Convert Firestore document to Group object
 */
export function fromFirestore(
  snapshot: QueryDocumentSnapshot,
  options?: SnapshotOptions
): Group {
  const data = snapshot.data(options);

  return {
    id: snapshot.id,
    name: data.name || '',
    description: data.description,
    iconUrl: data.iconUrl,
    adminIds: data.adminIds || [],
    memberIds: data.memberIds || [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    createdBy: data.createdBy || '',
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  };
}

/**
 * Convert Group object to Firestore document
 */
export function toFirestore(group: Partial<Group>): DocumentData {
  const firestoreData: any = {};

  if (group.name !== undefined) firestoreData.name = group.name;
  if (group.description !== undefined) firestoreData.description = group.description;
  if (group.iconUrl !== undefined) firestoreData.iconUrl = group.iconUrl;
  if (group.adminIds !== undefined) firestoreData.adminIds = group.adminIds;
  if (group.memberIds !== undefined) firestoreData.memberIds = group.memberIds;
  if (group.createdBy !== undefined) firestoreData.createdBy = group.createdBy;

  if (group.createdAt !== undefined) {
    firestoreData.createdAt =
      group.createdAt instanceof Date
        ? Timestamp.fromDate(group.createdAt)
        : group.createdAt;
  }

  if (group.updatedAt !== undefined) {
    firestoreData.updatedAt =
      group.updatedAt instanceof Date
        ? Timestamp.fromDate(group.updatedAt)
        : group.updatedAt;
  }

  return firestoreData;
}

/**
 * Check if a user is an admin of the group
 */
export function isAdmin(group: Group, userId: string): boolean {
  return group.adminIds.includes(userId);
}

/**
 * Check if a user is a member of the group
 */
export function isMember(group: Group, userId: string): boolean {
  return group.memberIds.includes(userId);
}

/**
 * Get display name for the group
 */
export function getDisplayName(group: Group): string {
  return group.name || 'Unnamed Group';
}

/**
 * Get member count
 */
export function getMemberCount(group: Group): number {
  return group.memberIds.length;
}

/**
 * Get admin count
 */
export function getAdminCount(group: Group): number {
  return group.adminIds.length;
}

/**
 * Add a member to the group
 */
export function addMember(group: Group, userId: string): Group {
  if (group.memberIds.includes(userId)) {
    return group; // Already a member
  }

  return {
    ...group,
    memberIds: [...group.memberIds, userId],
    updatedAt: new Date(),
  };
}

/**
 * Remove a member from the group
 */
export function removeMember(group: Group, userId: string): Group {
  return {
    ...group,
    memberIds: group.memberIds.filter((id) => id !== userId),
    // If removing an admin, also remove from adminIds
    adminIds: group.adminIds.filter((id) => id !== userId),
    updatedAt: new Date(),
  };
}

/**
 * Promote a member to admin
 */
export function promoteToAdmin(group: Group, userId: string): Group {
  if (!group.memberIds.includes(userId)) {
    throw new Error('User is not a member of the group');
  }

  if (group.adminIds.includes(userId)) {
    return group; // Already an admin
  }

  return {
    ...group,
    adminIds: [...group.adminIds, userId],
    updatedAt: new Date(),
  };
}

/**
 * Demote an admin to regular member
 */
export function demoteFromAdmin(group: Group, userId: string): Group {
  if (group.adminIds.length === 1 && group.adminIds.includes(userId)) {
    throw new Error('Cannot demote the last admin');
  }

  return {
    ...group,
    adminIds: group.adminIds.filter((id) => id !== userId),
    updatedAt: new Date(),
  };
}

/**
 * Update group information
 */
export function updateGroupInfo(
  group: Group,
  updates: Partial<Pick<Group, 'name' | 'description' | 'iconUrl'>>
): Group {
  return {
    ...group,
    ...updates,
    updatedAt: new Date(),
  };
}

/**
 * Validate group data
 */
export function validateGroup(group: Partial<Group>): string | null {
  if (!group.name || group.name.trim().length === 0) {
    return 'Group name is required';
  }

  if (group.name.trim().length > 100) {
    return 'Group name must be 100 characters or less';
  }

  if (group.description && group.description.length > 500) {
    return 'Group description must be 500 characters or less';
  }

  if (!group.memberIds || group.memberIds.length < 2) {
    return 'Group must have at least 2 members';
  }

  if (!group.adminIds || group.adminIds.length === 0) {
    return 'Group must have at least 1 admin';
  }

  // Validate that all admins are also members
  if (group.adminIds.some((adminId) => !group.memberIds!.includes(adminId))) {
    return 'All admins must be members of the group';
  }

  return null;
}


