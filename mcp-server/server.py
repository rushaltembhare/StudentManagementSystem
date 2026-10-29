import os
from pymongo import MongoClient

# MCP v1 aur v2 dono ke liye compatibility handler
try:
    from mcp.server.fastmcp import FastMCP
    mcp = FastMCP("student-management")
except ModuleNotFoundError:
    from mcp.server.mcpserver import MCPServer
    mcp = MCPServer("student-management")

# Tumhara MongoDB connection URL
MONGO_URI = "mongodb+srv://student_api_user:clg_Personal.@studentcluster.rymwx5w.mongodb.net/studentDB?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client["student_db"]  # Tera exact database name

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