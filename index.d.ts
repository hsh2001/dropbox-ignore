interface SetDropboxIgnoreParam {
  filePath: string;
  ignore: boolean;
  silent?: boolean;
}

declare const setDropboxIgnore: (p0: SetDropboxIgnoreParam) => Promise<boolean>;

export { setDropboxIgnore };
