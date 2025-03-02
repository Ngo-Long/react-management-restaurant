import * as XLSX from 'xlsx';
import moment from 'moment/moment';
import { UploadFile, RcFile } from "antd/es/upload";

/**
 * Return the first file from the fileList
 * @param fileList
 * @returns {RcFile | undefined}
 */
export const singleFileLoader = (fileList: UploadFile[] | undefined): RcFile | undefined => {
    if (!fileList || fileList.length === 0) return undefined;
    return fileList[0].originFileObj as RcFile;
}

/**
 * Process file and return a promise with a file text content
 * @param {Promise<string>}
 * @returns file
 */
export const textFileProcessor = (file: RcFile | undefined): Promise<String> => {
    if (!file) return Promise.resolve('');
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    })
}

/**
 * Process file and return a promise with a file text content
 * @param {Promise<string>}
 * @returns file
 */
export const base64FileProcessor = (file: RcFile | undefined): Promise<String> => {
    if (!file) return Promise.resolve('');
    const convertBase64WithoutHeader = (fullValue: string) => fullValue?.split(',')[1];
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(convertBase64WithoutHeader(reader.result as string));
        reader.onerror = (error) => reject(error);
    })
}

export const convertCSV = <T>(data: T) => {
    if (typeof data === 'number') {
        if (data.toString().length === 13) {
            return moment(data).format("DD/MM/yyyy HH:mm:ss") || data;
        }

        return data | 0;
    }

    if (typeof data !== 'string') return data;

    return data.replace(/"/g, '""').replace(/ +(?= )/g, '');
}

export const handleExportAsXlsx = <T>(data: T[], handler?: (data: T[]) => any[]) => {
    return (e: any) => {
        const exportData = handler && typeof handler === 'function' ? handler(data) : data;
        const sheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
        XLSX.writeFile(workbook, 'data.xlsx');
    }
}

export const handleImportXlsx = (file: RcFile | undefined): Promise<any[]> => {
    if (!file) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            resolve(jsonData);
        };
        reader.onerror = (error) => reject(error);
    })
}