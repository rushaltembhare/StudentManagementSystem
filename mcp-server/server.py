import os
from pymongo import MongoClient

# MCP v1 and v2 compatibility import
try:
    from mcp.server.fastmcp import FastMCP
    mcp = FastMCP("student-management")
except ModuleNotFoundError:
    from mcp.server.mcpserver import MCPServer
    mcp = MCPServer("student-management")

# MongoDB connection string with environment variable fallback
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://student_api_user:clg_Personal.@studentcluster.rymwx5w.mongodb.net/studentDB?retryWrites=true&w=majority"
)

# Connect to MongoClient
client = MongoClient(MONGO_URI)

# Use the exact database name 'student_db'
db = client.get_database("student_db")

@mcp.tool()
def update_theme(color_name: str) -> str:
    """Update website theme color directly in MongoDB settings collection."""
    try:
        # Lowercase clean string
        clean_color = color_name.strip().lower()
        
        # Upsert theme in settings collection
        result = db.settings.update_one(
            {}, 
            {"$set": {"theme": clean_color}}, 
            upsert=True
        )
        
        return f"Successfully updated website theme to '{clean_color}' in MongoDB!"
    except Exception as e:
        return f"Failed to update theme: {str(e)}"

if __name__ == "__main__":
    mcp.run()