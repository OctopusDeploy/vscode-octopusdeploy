import { CancellationToken, Hover, HoverProvider, TextDocument, Position } from 'vscode';

class OclHoverProvider implements HoverProvider {
    public provideHover(document: TextDocument, position: Position, token: CancellationToken): Thenable<Hover> {
		return new Hover('I am a hover!');
    }
}