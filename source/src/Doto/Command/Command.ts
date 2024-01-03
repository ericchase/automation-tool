export enum CommandType {
  Build,
  Check,
  Copy,
  Doto,
  Help,
  Parse,
  Run,
  Version,
  When,
}

export function CommandTypeToString(type: CommandType) {
  switch (type) {
    case CommandType.Build:
      return 'Build';
    case CommandType.Check:
      return 'Check';
    case CommandType.Copy:
      return 'Copy';
    case CommandType.Doto:
      return 'Doto';
    case CommandType.Help:
      return 'Help';
    case CommandType.Parse:
      return 'Parse';
    case CommandType.Run:
      return 'Run';
    case CommandType.Version:
      return 'Version';
    case CommandType.When:
      return 'When';
  }
}

export interface ICommand {
  type: CommandType;
  args: Uint8Array[];
  fileName: string;
  lineNumber: number;
  line: Uint8Array;
}

export class Command implements ICommand {
  constructor(
    public type: CommandType,
    public args: Uint8Array[],
    public fileName: string,
    public lineNumber: number,
    public line: Uint8Array,
  ) {}
}
