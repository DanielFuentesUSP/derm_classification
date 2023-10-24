class DICOMZero {
  constructor(options={}) {
    this.status = options.status || function() {};
    this.reset();
  }

  reset() {
    this.mappingLog = [];
    this.dataTransfer = undefined;
    this.datasets = [];
    this.readers = [];
    this.arrayBuffers = [];
    this.files = [];
    this.fileIndex = 0;
    this.context = { patients: [] };
    this.min_aquis_time = 0;
    this.filenames = [];
    
  }
  readOneFile(doneCallback) {
    let file = this.dataTransfer[this.fileIndex];
    
    let reader = new FileReader();
    // reader.onload = this.getReadDICOMFunction(doneCallback, statusCallback);
    reader.readAsArrayBuffer(file);
    reader.onload = (progressEvent) => {
      let dataset = DICOMZero.datasetFromArrayBufferAnon(reader.result);
      console.log('dataset', dataset)

      doneCallback(dataset);
    }
  }

  static datasetFromArrayBufferFast(arrayBuffer) {
    let dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
    let dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);
    dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(dicomData.meta);
    return(dataset);
  }
  static datasetFromArrayBufferAnon(arrayBuffer) {
    let dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
    let dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);
    dataset.PatientName = "Anonimo"
    dataset.PatientID = "Anonimo"
    dataset.PatientBirthDate = "19010101";
    dataset.InstitutionAddress = " ";
    dataset.InstitutionName = " ";
    dataset.StudyDate = "19010101"
    dataset.AccessionNumber = "000001"
    dataset.AcquisitionTime = 1;
    dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(dicomData.meta);
    // console.log(dataset.SeriesDescription)
    // console.log(dataset.AcquisitionTime )
    return(dataset);
  }


  handleDataTransferFileAsDataset(file, options={}) {
    options.doneCallback = options.doneCallback || function(){};

    let reader = new FileReader();
    reader.onload = (progressEvent) => {
      let dataset = DICOMZero.datasetFromArrayBuffer(reader.result);
      options.doneCallback(dataset);
    }
    reader.readAsArrayBuffer(file);
  }
  
  extractDatasetFromZipArrayBufferSaveTimes(arrayBuffer, file_name) {
    this.status(`Extracting ${this.datasets.length} of ${this.expectedDICOMFileCount}...`);
    let dataset;
    
    try {
      dataset = DICOMZero.datasetFromArrayBufferFast(arrayBuffer);
      this.datasets.push({ 'file_name':file_name,'time':dataset.AcquisitionTime, 'serie_desc': dataset.SeriesDescription, 'serie_uid':dataset.SeriesInstanceUID});
      
    } catch (error) {
      console.log('erro ao abrir dicom: ', file_name)
      console.error(error);
      this.expectedDICOMFileCount=this.expectedDICOMFileCount-1;
    }

    if (this.datasets.length >0 && (this.datasets.length == this.expectedDICOMFileCount)) {
      console.log(' expectedDICOMFileCount: ', this.expectedDICOMFileCount)
      console.log(' datasets.length: ', this.datasets.length)
      this.status(`Finished extracting`);
      this.zipFinishCallback();
    }
  };

  extractDatasetFromZipArrayBuffer(arrayBuffer) {
    this.status(`Extracting ${this.datasets.length} of ${this.expectedDICOMFileCount}...`);
    try {
      this.datasets.push(DICOMZero.datasetFromArrayBufferAnon(arrayBuffer));
    } catch (error) {
      console.error(error);
      this.expectedDICOMFileCount=this.expectedDICOMFileCount-1;
    
    }
    
    if (this.datasets.length >0 && this.datasets.length == this.expectedDICOMFileCount) {
      console.log('datasets.length: ', this.datasets.length)
      console.log('expectedDICOMFileCount: ', this.expectedDICOMFileCount )
      this.status(`Finished extracting`);
      this.zipFinishCallback();
    }
  };



  handleZip(zip) {
    this.zip = zip;
    this.expectedDICOMFileCount = 0;
    const promises = [];

    Object.keys(zip.files).forEach(fileKey => {
      this.status(`Considering ${fileKey}...`);
      // if (fileKey.endsWith('.dcm')) {
        this.expectedDICOMFileCount += 1;
        zip.files[fileKey].async('arraybuffer').then((arrayb) => {
          // zip.files[fileKey].async('arraybuffer').then(this.extractDatasetFromZipArrayBuffer.bind(this));
          this.extractDatasetFromZipArrayBufferSaveTimes(arrayb, fileKey)
        });

      // }
    });

  }
  handleZipFileNames(zip) {
    console.log('handleZipFileNames');
    this.zip = zip;
    this.expectedDICOMFileCount = 0;
    const promises = [];

    Object.keys(zip.files).forEach(fileKey => {
      this.status(`Considering ${fileKey}...`);
      if (this.filenames.includes(fileKey)) {
          
        this.expectedDICOMFileCount += 1;
        zip.files[fileKey].async('arraybuffer').then((arrayb) => {
          // zip.files[fileKey].async('arraybuffer').then(this.extractDatasetFromZipArrayBuffer.bind(this));
          this.extractDatasetFromZipArrayBuffer(arrayb)
      });
      }
    });


  }

  extractFromZipArrayBuffer(arrayBuffer, finishCallback=function(){}) {
    this.zipFinishCallback = finishCallback;
    this.status("Extracting from zip...");
    JSZip.loadAsync(arrayBuffer)
    .then(this.handleZip.bind(this));
  }


  extractFromZipArrayBufferFileNames(arrayBuffer, filenames,finishCallback=function(){}) {
    this.zipFinishCallback = finishCallback;
    this.filenames = filenames;
    this.status("Extracting from zip...");
    JSZip.loadAsync(arrayBuffer)
    .then(this.handleZipFileNames.bind(this));
  }

  organizeDatasets() {
    this.datasets.forEach(dataset => {
      let patientName = dataset.PatientName;
      let studyTag = dataset.StudyDate + ": " + dataset.StudyDescription;
      let seriesTag = dataset.SeriesNumber + ": " + dataset.SeriesDescription;
      let patientNames = this.context.patients.map(patient => patient.name);
      let patientIndex = patientNames.indexOf(dataset.PatientName);
      if (patientIndex == -1) {
        this.context.patients.push({
          name: dataset.PatientName,
          id: this.context.patients.length,
          studies: {}
        });
      }
      let studyNames; // TODO - finish organizing
    });
  }
}
