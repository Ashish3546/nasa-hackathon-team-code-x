// ML Model Trainer - Trains the weather prediction model
const { TRAINING_DATA } = require('./trainingData');
const { WeatherMLModel } = require('./mlModel');

class ModelTrainer {
  constructor() {
    this.model = new WeatherMLModel();
    this.learningRate = 0.01;
    this.epochs = 100;
  }
  
  // Simple gradient descent training
  train() {
    console.log('Starting model training...');
    console.log(`Training samples: ${TRAINING_DATA.length}`);
    
    const trainData = this.prepareTrainingData();
    
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      let totalLoss = 0;
      const gradients = this.initializeGradients();
      
      // Forward pass and gradient calculation
      for (const sample of trainData) {
        const prediction = this.model.predict(sample.features);
        const loss = this.calculateLoss(prediction.probability, sample.target);
        totalLoss += loss;
        
        // Calculate gradients (simplified)
        this.updateGradients(gradients, sample, prediction, loss);
      }
      
      // Update weights
      this.updateWeights(gradients, trainData.length);
      
      if (epoch % 20 === 0) {
        const avgLoss = totalLoss / trainData.length;
        console.log(`Epoch ${epoch}: Average Loss = ${avgLoss.toFixed(4)}`);
      }
    }
    
    console.log('Training completed!');
    this.evaluateModel(trainData);
  }
  
  prepareTrainingData() {
    return TRAINING_DATA.map(sample => ({
      features: {
        lat: sample.lat,
        lon: sample.lon,
        month: sample.month,
        dayOfYear: sample.dayOfYear,
        season: sample.season,
        temperature: sample.temperature,
        humidity: sample.humidity,
        pressure: sample.pressure,
        windSpeed: sample.windSpeed
      },
      target: sample.rainProbability
    }));
  }
  
  calculateLoss(predicted, actual) {
    // Mean squared error
    return Math.pow(predicted - actual, 2);
  }
  
  initializeGradients() {
    return {
      lat: 0,
      lon: 0,
      month: 0,
      dayOfYear: 0,
      season: 0,
      temperature: 0,
      humidity: 0,
      pressure: 0,
      windSpeed: 0,
      bias: 0
    };
  }
  
  updateGradients(gradients, sample, prediction, loss) {
    const error = prediction.probability - sample.target;
    const sigmoid_derivative = prediction.probability * (1 - prediction.probability);
    const gradient_factor = 2 * error * sigmoid_derivative;
    
    // Simplified gradient calculation
    gradients.lat += gradient_factor * this.model.normalize(sample.features.lat, 'lat');
    gradients.lon += gradient_factor * this.model.normalize(sample.features.lon, 'lon');
    gradients.month += gradient_factor * (sample.features.month / 12);
    gradients.temperature += gradient_factor * this.model.normalize(sample.features.temperature, 'temperature');
    gradients.humidity += gradient_factor * this.model.normalize(sample.features.humidity, 'humidity');
    gradients.pressure += gradient_factor * this.model.normalize(sample.features.pressure, 'pressure');
    gradients.windSpeed += gradient_factor * this.model.normalize(sample.features.windSpeed, 'windSpeed');
    gradients.bias += gradient_factor;
  }
  
  updateWeights(gradients, sampleCount) {
    // Update model weights using gradients
    this.model.weights.lat -= this.learningRate * (gradients.lat / sampleCount);
    this.model.weights.lon -= this.learningRate * (gradients.lon / sampleCount);
    this.model.weights.month -= this.learningRate * (gradients.month / sampleCount);
    this.model.weights.temperature -= this.learningRate * (gradients.temperature / sampleCount);
    this.model.weights.humidity -= this.learningRate * (gradients.humidity / sampleCount);
    this.model.weights.pressure -= this.learningRate * (gradients.pressure / sampleCount);
    this.model.weights.windSpeed -= this.learningRate * (gradients.windSpeed / sampleCount);
    this.model.weights.bias -= this.learningRate * (gradients.bias / sampleCount);
  }
  
  evaluateModel(testData) {
    let correct = 0;
    let totalError = 0;
    
    for (const sample of testData) {
      const prediction = this.model.predict(sample.features);
      const predicted_class = prediction.probability > 0.5 ? 1 : 0;
      const actual_class = sample.target > 0.5 ? 1 : 0;
      
      if (predicted_class === actual_class) correct++;
      totalError += Math.abs(prediction.probability - sample.target);
    }
    
    const accuracy = correct / testData.length;
    const mae = totalError / testData.length;
    
    console.log(`\nModel Evaluation:`);
    console.log(`Accuracy: ${(accuracy * 100).toFixed(2)}%`);
    console.log(`Mean Absolute Error: ${mae.toFixed(4)}`);
    
    // Test on different climate zones
    this.testByClimate(testData);
  }
  
  testByClimate(testData) {
    const climateResults = {};
    
    for (const sample of testData) {
      const climateZone = this.model.getClimateZone(sample.features.lat);
      if (!climateResults[climateZone]) {
        climateResults[climateZone] = { correct: 0, total: 0 };
      }
      
      const prediction = this.model.predict(sample.features);
      const predicted_class = prediction.probability > 0.5 ? 1 : 0;
      const actual_class = sample.target > 0.5 ? 1 : 0;
      
      if (predicted_class === actual_class) {
        climateResults[climateZone].correct++;
      }
      climateResults[climateZone].total++;
    }
    
    console.log(`\nAccuracy by Climate Zone:`);
    for (const [zone, results] of Object.entries(climateResults)) {
      const accuracy = (results.correct / results.total * 100).toFixed(1);
      console.log(`${zone}: ${accuracy}% (${results.correct}/${results.total})`);
    }
  }
}

// Train the model when this module is loaded
const trainer = new ModelTrainer();
trainer.train();

module.exports = { ModelTrainer };