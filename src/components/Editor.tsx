interface EditorProps {
  content: string;
}

export const Editor = ({ content }: EditorProps) => {
  return (
    <div className="min-h-[400px] bg-editor-bg rounded-lg p-8 shadow-sm border border-border">
      <div className="prose prose-lg max-w-none">
        <div 
          className="whitespace-pre-wrap text-editor-text leading-relaxed"
          style={{ 
            fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
            fontSize: '1.125rem',
            lineHeight: '1.75'
          }}
        >
          {content || (
            <span className="text-muted-foreground italic">
              Your essay will appear here as we write together...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};