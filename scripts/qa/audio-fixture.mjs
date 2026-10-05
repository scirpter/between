import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('output/playwright',{recursive:true});
const rate=8000, seconds=8, length=rate*seconds*2;
const wav=Buffer.alloc(44+length);
wav.write('RIFF'); wav.writeUInt32LE(36+length,4); wav.write('WAVEfmt ',8);
wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(1,22);
wav.writeUInt32LE(rate,24); wav.writeUInt32LE(rate*2,28); wav.writeUInt16LE(2,32); wav.writeUInt16LE(16,34);
wav.write('data',36); wav.writeUInt32LE(length,40);
writeFileSync('output/playwright/silence.wav',wav);
