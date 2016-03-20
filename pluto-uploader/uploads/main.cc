#include <vector>
#include <iostream>
#include <random>
#include <algorithm>


struct feature_with_label{
  feature_with_label(double x1_, int label_) : x1(x1_), label(label_){}
  double x1;
  int label;
};

struct sorter{
    inline bool operator()(const feature_with_label& a, const feature_with_label& b)
    {
        return (a.x1 < b.x1);
    }
};

double generate_gaussian_realization(double mean, double standard_deviation){
	static std::default_random_engine generator;
	static std::normal_distribution<double> distribution(mean,standard_deviation);
	double output = distribution(generator);
	return output;

}

 double computeDifference (feature_with_label& f1, feature_with_label& f2){
    return std::abs(f1.x1-f2.x1);
 }

void classifier(std::vector<feature_with_label> trainingSet, std::vector<feature_with_label> testingSet, int K){
    int success = 0;
    int failure = 0;
    double successPercent = 0.0;
    double failurePercent = 0.0;

    for(int i=0; i<testingSet.size(); i++){
        std::vector<feature_with_label> featureDifference;
        for(int j=0;j<trainingSet.size();j++){
            double x = computeDifference(testingSet[i],trainingSet[j]);
            featureDifference.push_back(feature_with_label(x, trainingSet[i].label));
        }
        
        std::sort(featureDifference.begin(), featureDifference.end(), sorter());

        int cl1 = 0, cl2 = 0;
        for(int j=0;j<K;j++){
            if(featureDifference[j].label == 1){
                cl1 += 1;
            }
            else if(featureDifference[j].label == 2){
                cl2 += 1;
            }
        }
     
        if(cl1 < cl2){
            if(testingSet[i].label == 2){
                success += 1;
                //std::cout << "\nSuccess"<< std::endl;
            }
            else{
                failure += 1;
                //std::cout << "\nFailed"<< std::endl;
            }
        }
        else if(cl1 > cl2){
            if(testingSet[i].label == 1){
                success += 1;
                //std::cout << "\nSuccess"<< std::endl;
            }
            else{
                failure += 1;
                //std::cout << "\nFailed"<< std::endl;
            }
        }
    }
    
    successPercent = (double)success/(double)testingSet.size();
    failurePercent = (double)failure/(double)testingSet.size();
    std::cout << "\nSuccess " << " rate for K=" << K << " is " << (double)successPercent*100 << "%" << std::endl;
}

int main(){
    
    

    int k[8] = {1,3,5,9,17,33,65,129};
    int testingSize[4] = {1,8,16,32};
    int label = 1;
    
    double feature;

    double mu1 = -1.;
    double sigma1 = 1.;
    double mu2 = 1.;
    double sigma2 = 1.;

    

    for(int j=0; j<4; j++){
        std::vector<feature_with_label> training_set;
        std::vector<feature_with_label> testing_set;

        int N1_training = 64;
        int N2_training = 64;
        int N_training = N1_training + N2_training;

        for (int i=0; i<N1_training; ++i){
            feature = generate_gaussian_realization(mu1, sigma1);
            label = 1;
            training_set.push_back(feature_with_label(feature, label));
        }

        for (int i=0; i<N2_training; ++i){
            feature = generate_gaussian_realization(mu2, sigma2);
            label = 2;
            training_set.push_back(feature_with_label(feature, label));
        }
        
        int N1_testing = testingSize[j];
        int N2_testing = 0;

        if(j != 0)
            N2_testing = testingSize[j];
        else
            N2_testing = 0;
        int N_testint = N1_testing + N2_testing;

        for (int i=0; i<N1_testing; ++i){
            feature = generate_gaussian_realization(mu1, sigma1);
            label = 1;
            testing_set.push_back(feature_with_label(feature, label));
        }

        for (int i=0; i<N2_testing; ++i){
            feature = generate_gaussian_realization(mu2, sigma2);
            label = 2;
            testing_set.push_back(feature_with_label(feature, label));
        }

        std::cout << "\nTesting Set size: " << testing_set.size() << std::endl;
        std::cout << "______________________________________________" << std::endl;
        for(int i=0; i<8; i++){
            classifier(training_set, testing_set, k[i]);
        }
        std::cout << "______________________________________________\n" << std::endl;
    }

    
}


