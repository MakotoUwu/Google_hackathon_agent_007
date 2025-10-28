/**
 * Node.js wrapper for calling the Python ADK agent
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface AgentResponse {
  success: boolean;
  response?: string;
  error?: string;
  session_id: string;
  user_id: string;
}

/**
 * Run the ADK agent with a query
 */
export async function runAgent(
  query: string,
  sessionId: string = "default",
  userId: string = "default"
): Promise<AgentResponse> {
  return new Promise((resolve, reject) => {
    const pythonPath = "python3.11";
    const scriptPath = path.resolve(process.cwd(), "maps_agent/runner.py");

    // Set environment variables for Vertex AI
    const env = {
      ...process.env,
      GOOGLE_GENAI_USE_VERTEXAI: "TRUE",
      GOOGLE_CLOUD_PROJECT: "qwiklabs-gcp-00-6bf2cd71dda4",
      GOOGLE_CLOUD_LOCATION: "us-central1",
      GOOGLE_APPLICATION_CREDENTIALS: path.resolve(
        process.cwd(),
        "maps_agent/qwiklabs-gcp-00-6bf2cd71dda4-c40f82b6785d.json"
      ),
    };

    const pythonProcess = spawn(pythonPath, [scriptPath, query, sessionId, userId], {
      env,
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse JSON response: ${stdout}`));
      }
    });

    pythonProcess.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Stream responses from the ADK agent (for future implementation)
 */
export async function* streamAgent(
  query: string,
  sessionId: string = "default",
  userId: string = "default"
): AsyncGenerator<string, void, unknown> {
  // TODO: Implement streaming by modifying runner.py to support streaming mode
  // For now, just yield the final response
  const response = await runAgent(query, sessionId, userId);
  if (response.success && response.response) {
    yield response.response;
  } else if (response.error) {
    throw new Error(response.error);
  }
}
