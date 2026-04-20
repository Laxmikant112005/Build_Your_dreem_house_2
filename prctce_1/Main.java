package prctce_1;

public class Main{
    int gray(int a, int b){
        return Math.max(a, b);
    }
    int less(int a, int b){
        return Math.min(a, b);
    }
    int squre(int x){
        return (int)(Math.sqrt(x));
    }
    void rad(){
        for(int i = 0; i < 5; i ++){
            int num = (int)(Math.random()*11);
            System.out.println(num);
        }
    }
    public static void main(String[] args){
        Main obj = new Main();
        int max = obj.gray(10, 20);
        int min = obj.less(10, 20);
        int sqr = obj.squre(16);
        System.out.println(max);
        System.out.println(min);
        System.out.println(sqr);
        obj.rad();
    }
}
