import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

app = Flask(__name__)
CORS(app)

llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
)

@app.route("/api/generate", methods=["POST"])
def generate():
    """
    Generate LLM response from user prompt.
    Returns raw LLM output without sanitization (intentional for demo).
    """
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        response = llm.invoke(prompt)
        
        content = response.content if hasattr(response, "content") else str(response)
        
        return jsonify({
            "content": content,
            "prompt": prompt
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 5000))
    app.run(debug=True, port=port)
