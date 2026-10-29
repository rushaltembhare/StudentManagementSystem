import os
from mcp.server.fastmcp import FastMCP
from pymongo import MongoClient

# Initialize MCP Server
mcp = FastMCP("student-management")

# Replace this string with your REAL MongoDB Atlas connection URL
MONGO_URI = "mongodb+srv://student_api_user:clg_Personal.@studentcluster.rymwx5w.mongodb.net/studentDB?retryWrites=true&w=majority"

# Connect to Database
client = MongoClient(MONGO_URI)
db = client["student_db"]  # Replace 'student_db' with your exact DB name

@mcp.tool()
def update_theme(color_name: str) -> str:
    """Update website theme color directly in MongoDB"""
    try:
        db.settings.update_one({}, {"$set": {"theme": color_name}}, upsert=True)
        return f"Successfully updated website theme to {color_name} in MongoDB!"
    except Exception as e:
        return f"Failed to update theme: {str(e)}"

if __name__ == "__main__":
    mcp.run()