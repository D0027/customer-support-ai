"""
MongoDB connection handler using Motor (async driver).
"""

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]

# Collections
users_collection = db["users"]
conversations_collection = db["conversations"]
messages_collection = db["messages"]
tickets_collection = db["tickets"]  # bonus: auto ticket creation
feedback_collection = db["feedback"]  # bonus: satisfaction feedback
reactions_collection = db["reactions"]
canned_responses_collection = db["canned_responses"]
audit_log_collection = db["audit_log"]
kb_gaps_collection = db["kb_gaps"]
admin_presence_collection = db["admin_presence"]
ab_test_results_collection = db["ab_test_results"]


async def ping_db() -> bool:
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return False
