import processing.serial.*;


int numOfShapes = 60; // Number of squares to display on screen 
int shapeSpeed = 2; // Speed at which the shapes move to new position
 // 2 = Fastest, Larger numbers are slower

//Global Variables 
Square[] mySquares = new Square[numOfShapes];
int shapeSize, distance;
String comPortString;
Serial myPort;

void setup(){
 //size(800,600); //Use entire screen size.
 fullScreen();
 smooth(); // draws all shapes with smooth edges.
 

 shapeSize = (width/numOfShapes); 
 for(int i = 0; i<numOfShapes; i++){
 mySquares[i]=new Square(int(shapeSize*i),height-40);
 }
 

 myPort = new Serial(this, "/dev/tty.usbmodem1411", 9600);
 myPort.bufferUntil('\n'); // Trigger a SerialEvent on new line
}

/* ------------------------Draw -----------------------------*/
void draw(){
 background(0); //Make the background BLACK
 delay(50); //Delay used to refresh screen
 drawSquares(); //Draw the pattern of squares
}


/* ---------------------serialEvent ---------------------------*/
//void serialEvent(Serial cPort){
// comPortString = cPort.readStringUntil('\n');
// if(comPortString != null) {
// comPortString=trim(comPortString);
 
// /* Use the distance received by the Arduino to modify the y position
// of the first square (others will follow). Should match the
// code settings on the Arduino. In this case 200 is the maximum
// distance expected. The distance is then mapped to a value
// between 1 and the height of your screen */
// distance = int(map(Integer.parseInt(comPortString),1,200,1,height));
// if(distance<0){
// /*If computer receives a negative number (-1), then the
// sensor is reporting an "out of range" error. Convert all
// of these to a distance of 0. */
// distance = 0;
// }
// }
//}

void serialEvent(Serial myPort) {
  String myString = myPort.readString();
  int value1;
  if(myString != null) {
    myString = trim(myString);
    value1 = int(myString);
    println(value1);
    
    distance = int(map(value1,1,300,1,height));
    distance = distance * 8;
    if(distance<0){
     /*If computer receives a negative number (-1), then the
     sensor is reporting an "out of range" error. Convert all
     of these to a distance of 0. */
     distance = 0;
     }
    
  }
}


void drawSquares(){
 int oldY, newY, targetY, redVal, blueVal;
 
 mySquares[0].setY((height-shapeSize)-distance);
 
 
 for(int i = numOfShapes-1; i>0; i--){
 
 targetY=mySquares[i-1].getY();
 oldY=mySquares[i].getY();
 
 if(abs(oldY-targetY)<2){
 newY=targetY; //This helps to line them up
 }else{
 
 newY=oldY-((oldY-targetY)/shapeSpeed);
 }
 
 mySquares[i].setY(newY);
 
 
 blueVal = int(map(newY,0,height,0,255));
 redVal = 255-blueVal;
 fill(redVal,0,blueVal);
 
 
 rect(mySquares[i].getX(), mySquares[i].getY(),shapeSize,shapeSize);
 }
}

/* ---------------------CLASS: Square ---------------------------*/
class Square{
 int xPosition, yPosition;
 
 Square(int xPos, int yPos){
 xPosition = xPos;
 yPosition = yPos;
 }
 
 int getX(){
 return xPosition;
 }
 
 int getY(){
 return yPosition;
 }
 
 void setY(int yPos){
 yPosition = yPos;
 }
}