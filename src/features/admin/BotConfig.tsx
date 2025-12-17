import { useState, useEffect } from 'react';
import { uploadData, downloadData } from 'aws-amplify/storage';
import { AdminLogger } from '../../services/Logger';

interface BotSettings {
    preferredName: string;
    fallbackPhrase: string;
    restrictions: string;
    instructions: string;
}

const DEFAULT_SETTINGS: BotSettings = {
    preferredName: 'ScottBot',
    fallbackPhrase: "Information for this question is not available.",
    restrictions: 'Avoid controversial topics. Do not use profanity.',
    instructions: 'Be helpful and professional.'
};

export function BotConfig() {
    const [settings, setSettings] = useState<BotSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const result = await downloadData({
                path: 'knowledge-base/bot-settings.json',
                options: {
                    useAccelerateEndpoint: false // Optional: adjust based on your needs
                }
            }).result;

            const text = await result.body.text();
            setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(text) });
        } catch (error) {
            // It's okay if file doesn't exist yet, we'll use defaults
            AdminLogger.warn("Could not load bot settings (might be first run):", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await uploadData({
                path: 'knowledge-base/bot-settings.json',
                data: JSON.stringify(settings, null, 2),
            }).result;

            setStatus({ type: 'success', message: 'Settings saved successfully!' });
            AdminLogger.info("Bot settings updated.");
        } catch (error: any) {
            AdminLogger.error("Failed to save bot settings:", error);
            setStatus({ type: 'error', message: `Failed to save: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof BotSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Bot Configuration</h3>
            <p className="text-dim">Fine-tune the chatbot's personality and rules.</p>

            {status && (
                <div className={`admin-message ${status.type}`} style={{ marginBottom: '1rem' }}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSave} className="admin-form">
                <div className="form-group">
                    <label>Preferred Bot Name</label>
                    <input
                        type="text"
                        value={settings.preferredName}
                        onChange={e => handleChange('preferredName', e.target.value)}
                        placeholder="e.g. Scott Assistant"
                    />
                </div>

                <div className="form-group">
                    <label>Fallback Phrase</label>
                    <small style={{ display: 'block', color: 'gray', marginBottom: '0.5rem' }}>
                        Returned when the bot cannot find an answer.
                    </small>
                    <input
                        type="text"
                        value={settings.fallbackPhrase}
                        onChange={e => handleChange('fallbackPhrase', e.target.value)}
                        placeholder="Information for this question is not available."
                    />
                </div>

                <div className="form-group">
                    <label>Restrictions / Negative Prompts</label>
                    <textarea
                        value={settings.restrictions}
                        onChange={e => handleChange('restrictions', e.target.value)}
                        placeholder="e.g. Do not mention specific competitors..."
                        rows={3}
                    />
                </div>

                <div className="form-group">
                    <label>Additional Instructions</label>
                    <textarea
                        value={settings.instructions}
                        onChange={e => handleChange('instructions', e.target.value)}
                        placeholder="e.g. Always be enthusiastic about coding..."
                        rows={4}
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Configuration'}
                </button>
            </form>
        </div>
    );
}
