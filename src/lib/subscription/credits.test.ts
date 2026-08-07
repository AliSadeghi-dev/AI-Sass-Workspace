import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

import {
  CreditsExhaustedError,
  FREE_PLAN_CREDITS,
  canSendMessage,
  consumeMessageCredit,
  getOrCreateSubscription,
} from "./credits";

jest.mock("../db");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockFindFirst = db.query.subscriptions.findFirst as jest.Mock;
const mockInsert = db.insert as jest.Mock;
const mockUpdate = db.update as jest.Mock;
const mockRevalidatePath = revalidatePath as jest.Mock;

const profileId = "user-123";

const baseSubscription = {
  id: "sub-1",
  profileId,
  planType: "free",
  status: "active",
  creditsAllowed: FREE_PLAN_CREDITS,
  creditsUsed: 0,
};

function mockInsertChain(result: unknown) {
  mockInsert.mockReturnValue({
    values: jest.fn().mockReturnValue({
      onConflictDoNothing: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue(result),
      }),
    }),
  });
}

function mockUpdateChain(result: unknown) {
  mockUpdate.mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue(result),
      }),
    }),
  });
}

describe("getOrCreateSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an existing subscription", async () => {
    mockFindFirst.mockResolvedValue(baseSubscription);

    const subscription = await getOrCreateSubscription(profileId);

    expect(subscription).toEqual(baseSubscription);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("creates a free subscription when none exists", async () => {
    mockFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockInsertChain([baseSubscription]);

    const subscription = await getOrCreateSubscription(profileId);

    expect(subscription).toEqual(baseSubscription);
    expect(mockInsert).toHaveBeenCalled();
  });
});

describe("canSendMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when credits remain", async () => {
    mockFindFirst.mockResolvedValue({
      ...baseSubscription,
      creditsUsed: 5,
    });

    await expect(canSendMessage(profileId)).resolves.toBe(true);
  });

  it("returns false when credits are exhausted", async () => {
    mockFindFirst.mockResolvedValue({
      ...baseSubscription,
      creditsUsed: FREE_PLAN_CREDITS,
    });

    await expect(canSendMessage(profileId)).resolves.toBe(false);
  });
});

describe("consumeMessageCredit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindFirst.mockResolvedValue(baseSubscription);
  });

  it("increments credits atomically and revalidates dashboard layout", async () => {
    const updatedSubscription = {
      ...baseSubscription,
      creditsUsed: 1,
    };
    mockUpdateChain([updatedSubscription]);

    const result = await consumeMessageCredit(profileId);

    expect(result).toEqual(updatedSubscription);
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("throws when no credits remain", async () => {
    mockFindFirst.mockResolvedValue({
      ...baseSubscription,
      creditsUsed: FREE_PLAN_CREDITS,
    });
    mockUpdateChain([]);

    await expect(consumeMessageCredit(profileId)).rejects.toBeInstanceOf(
      CreditsExhaustedError,
    );
  });
});
