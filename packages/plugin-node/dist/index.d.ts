import { Service, IBrowserService, ServiceType, IAgentRuntime, IImageDescriptionService, IPdfService, ISpeechService, ITranscriptionService, IVideoService, Media, IAwsS3Service } from '@ai16z/eliza';
import { Readable } from 'stream';

type PageContent = {
    title: string;
    description: string;
    bodyContent: string;
};
declare class BrowserService extends Service implements IBrowserService {
    private browser;
    private context;
    private blocker;
    private captchaSolver;
    private cacheKey;
    static serviceType: ServiceType;
    static register(runtime: IAgentRuntime): IAgentRuntime;
    getInstance(): IBrowserService;
    constructor();
    initialize(): Promise<void>;
    initializeBrowser(): Promise<void>;
    closeBrowser(): Promise<void>;
    getPageContent(url: string, runtime: IAgentRuntime): Promise<PageContent>;
    private getCacheKey;
    private fetchPageContent;
    private detectCaptcha;
    private solveCaptcha;
    private getHCaptchaWebsiteKey;
    private getReCaptchaWebsiteKey;
    private tryAlternativeSources;
}

declare class ImageDescriptionService extends Service implements IImageDescriptionService {
    static serviceType: ServiceType;
    private modelId;
    private device;
    private model;
    private processor;
    private tokenizer;
    private initialized;
    private runtime;
    private queue;
    private processing;
    getInstance(): IImageDescriptionService;
    initialize(runtime: IAgentRuntime): Promise<void>;
    private initializeLocalModel;
    describeImage(imageUrl: string): Promise<{
        title: string;
        description: string;
    }>;
    private recognizeWithOpenAI;
    private requestOpenAI;
    private processQueue;
    private processImage;
    private extractFirstFrameFromGif;
}

declare class LlamaService extends Service {
    private llama;
    private model;
    private modelPath;
    private grammar;
    private ctx;
    private sequence;
    private modelUrl;
    private ollamaModel;
    private messageQueue;
    private isProcessing;
    private modelInitialized;
    private runtime;
    static serviceType: ServiceType;
    constructor();
    initialize(runtime: IAgentRuntime): Promise<void>;
    private ensureInitialized;
    initializeModel(): Promise<void>;
    checkModel(): Promise<void>;
    deleteModel(): Promise<void>;
    queueMessageCompletion(context: string, temperature: number, stop: string[], frequency_penalty: number, presence_penalty: number, max_tokens: number): Promise<any>;
    queueTextCompletion(context: string, temperature: number, stop: string[], frequency_penalty: number, presence_penalty: number, max_tokens: number): Promise<string>;
    private processQueue;
    completion(prompt: string, runtime: IAgentRuntime): Promise<string>;
    embedding(text: string, runtime: IAgentRuntime): Promise<number[]>;
    private getCompletionResponse;
    getEmbeddingResponse(input: string): Promise<number[] | undefined>;
    private ollamaCompletion;
    private ollamaEmbedding;
    private localCompletion;
    private localEmbedding;
}

declare class PdfService extends Service implements IPdfService {
    static serviceType: ServiceType;
    constructor();
    getInstance(): IPdfService;
    initialize(_runtime: IAgentRuntime): Promise<void>;
    convertPdfToText(pdfBuffer: Buffer): Promise<string>;
}

declare class SpeechService extends Service implements ISpeechService {
    static serviceType: ServiceType;
    initialize(_runtime: IAgentRuntime): Promise<void>;
    getInstance(): ISpeechService;
    generate(runtime: IAgentRuntime, text: string): Promise<Readable>;
}

declare class TranscriptionService extends Service implements ITranscriptionService {
    private runtime;
    static serviceType: ServiceType;
    private CONTENT_CACHE_DIR;
    private DEBUG_AUDIO_DIR;
    private TARGET_SAMPLE_RATE;
    private isCudaAvailable;
    private openai;
    private deepgram?;
    private queue;
    private processing;
    initialize(_runtime: IAgentRuntime): Promise<void>;
    constructor();
    private ensureCacheDirectoryExists;
    private ensureDebugDirectoryExists;
    private detectCuda;
    private convertAudio;
    private saveDebugAudio;
    transcribeAttachment(audioBuffer: ArrayBuffer): Promise<string | null>;
    transcribe(audioBuffer: ArrayBuffer): Promise<string | null>;
    transcribeAttachmentLocally(audioBuffer: ArrayBuffer): Promise<string | null>;
    private processQueue;
    private transcribeWithDeepgram;
    private transcribeWithOpenAI;
    transcribeLocally(audioBuffer: ArrayBuffer): Promise<string | null>;
}

declare class VideoService extends Service implements IVideoService {
    static serviceType: ServiceType;
    private cacheKey;
    private dataDir;
    private queue;
    private processing;
    constructor();
    getInstance(): IVideoService;
    initialize(_runtime: IAgentRuntime): Promise<void>;
    private ensureDataDirectoryExists;
    isVideoUrl(url: string): boolean;
    downloadMedia(url: string): Promise<string>;
    downloadVideo(videoInfo: any): Promise<string>;
    processVideo(url: string, runtime: IAgentRuntime): Promise<Media>;
    private processQueue;
    private processVideoFromUrl;
    private getVideoId;
    fetchVideoInfo(url: string): Promise<any>;
    private getTranscript;
    private downloadCaption;
    private parseCaption;
    private parseSRT;
    private downloadSRT;
    transcribeAudio(url: string, runtime: IAgentRuntime): Promise<string>;
    private convertMp4ToMp3;
    private downloadAudio;
}

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}
interface JsonUploadResult extends UploadResult {
    key?: string;
}
declare class AwsS3Service extends Service implements IAwsS3Service {
    static serviceType: ServiceType;
    private s3Client;
    private bucket;
    private fileUploadPath;
    private runtime;
    initialize(runtime: IAgentRuntime): Promise<void>;
    private initializeS3Client;
    uploadFile(filePath: string, subDirectory?: string, useSignedUrl?: boolean, expiresIn?: number): Promise<UploadResult>;
    /**
     * Generate signed URL for existing file
     */
    generateSignedUrl(fileName: string, expiresIn?: number): Promise<string>;
    private getContentType;
    /**
     * Upload JSON object to S3
     * @param jsonData JSON data to upload
     * @param fileName File name (optional, without path)
     * @param subDirectory Subdirectory (optional)
     * @param useSignedUrl Whether to use signed URL
     * @param expiresIn Signed URL expiration time (seconds)
     */
    uploadJson(jsonData: any, fileName?: string, subDirectory?: string, useSignedUrl?: boolean, expiresIn?: number): Promise<JsonUploadResult>;
}

type NodePlugin = ReturnType<typeof createNodePlugin>;
declare function createNodePlugin(): {
    readonly name: "default";
    readonly description: "Default plugin, with basic actions and evaluators";
    readonly services: [BrowserService, ImageDescriptionService, LlamaService, PdfService, SpeechService, TranscriptionService, VideoService, AwsS3Service];
};

export { AwsS3Service, BrowserService, ImageDescriptionService, LlamaService, type NodePlugin, PdfService, SpeechService, TranscriptionService, VideoService, createNodePlugin };
